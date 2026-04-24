import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { raasCalcInputSchema, type RaasCalcInput } from '../lib/schemas/raas';
import {
  searchRobotModels,
  getRobotModelByCode,
  calculateRaasComparison,
  type RobotModel,
  type RaasCalculationResult,
} from '../lib/mockRobotModels';
import { Button } from '../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../app/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../app/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../app/components/ui/popover';
import { QuoteRequestModal } from '../app/components/calculator/QuoteRequestModal';
import { Badge } from '../app/components/ui/badge';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function CalculatorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<RobotModel | null>(null);
  const [results, setResults] = useState<RaasCalculationResult | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'capex' | 'lease' | 'raas'>('raas');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RaasCalcInput>({
    resolver: zodResolver(raasCalcInputSchema),
    mode: 'onChange',
    defaultValues: {
      robot_model: '',
      quantity: 1,
      term_months: '36',
    },
  });

  const quantity = watch('quantity');
  const termMonths = watch('term_months');

  const filteredModels = searchRobotModels(searchQuery);

  const handleSelectModel = (model: RobotModel) => {
    setSelectedModel(model);
    setValue('robot_model', model.code, { shouldValidate: true });
    setOpen(false);
  };

  const onSubmit = (data: RaasCalcInput) => {
    if (!selectedModel) return;

    const calculation = calculateRaasComparison(
      selectedModel.base_price,
      data.quantity,
      parseInt(data.term_months)
    );

    setResults(calculation);
  };

  const handleQuoteRequest = (plan: 'capex' | 'lease' | 'raas') => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSelectedPlan(plan);
    setQuoteModalOpen(true);
  };

  const planLabels = {
    capex: '일시불 (CAPEX)',
    lease: '리스',
    raas: 'RaaS (OPEX)',
  };

  // Prepare chart data
  const tcoData = results ? [
    { name: 'CAPEX', value: results.capex.total_cost },
    { name: 'Lease', value: results.lease.total_cost - results.lease.residual_value },
    { name: 'RaaS', value: results.raas.total_cost },
  ] : [];

  // ROI cumulative cost data
  const roiData = results ? Array.from({ length: parseInt(termMonths) }, (_, i) => {
    const month = i + 1;
    return {
      month,
      CAPEX: results.capex.total_cost,
      Lease: results.lease.monthly_payment * month,
      RaaS: results.raas.monthly_subscription * month,
    };
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">RaaS 비용 계산기</h1>
          <p className="text-gray-600">
            로봇 도입 방식(일시불/리스/RaaS)별 비용을 비교해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>계산 조건 입력</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Robot Model Combobox */}
                  <div className="space-y-2">
                    <Label htmlFor="robot_model">
                      로봇 모델 <span className="text-red-600">*</span>
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="robot_model"
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                          aria-invalid={!!errors.robot_model}
                        >
                          {selectedModel ? selectedModel.name : '모델 선택...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="모델 코드나 이름으로 검색..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandList>
                            <CommandEmpty>모델을 찾을 수 없습니다.</CommandEmpty>
                            <CommandGroup>
                              {filteredModels.map((model) => (
                                <CommandItem
                                  key={model.id}
                                  value={model.code}
                                  onSelect={() => handleSelectModel(model)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedModel?.id === model.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    }`}
                                  />
                                  <div>
                                    <div className="font-semibold">{model.code}</div>
                                    <div className="text-sm text-gray-600">{model.name}</div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.robot_model && (
                      <p className="text-sm text-red-600" role="alert">
                        {errors.robot_model.message}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      수량 <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      {...register('quantity', { valueAsNumber: true })}
                      aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                      aria-invalid={!!errors.quantity}
                    />
                    {errors.quantity && (
                      <p id="quantity-error" className="text-sm text-red-600" role="alert">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>

                  {/* Term */}
                  <div className="space-y-2">
                    <Label htmlFor="term_months">
                      계약 기간 <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={termMonths}
                      onValueChange={(value) => setValue('term_months', value as any)}
                    >
                      <SelectTrigger id="term_months">
                        <SelectValue placeholder="기간 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12개월</SelectItem>
                        <SelectItem value="24">24개월</SelectItem>
                        <SelectItem value="36">36개월</SelectItem>
                        <SelectItem value="48">48개월</SelectItem>
                        <SelectItem value="60">60개월</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.term_months && (
                      <p className="text-sm text-red-600" role="alert">
                        {errors.term_months.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedModel}
                  >
                    비교 계산
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {!results ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <p className="text-gray-500">
                    왼쪽 폼에서 조건을 입력하고 '비교 계산'을 눌러주세요
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CAPEX Card */}
                  <Card className={results.cheapest_option === 'capex' ? 'border-green-500 border-2' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">일시불 (CAPEX)</CardTitle>
                        {results.cheapest_option === 'capex' && (
                          <Badge variant="default" className="bg-green-600">추천</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">총 구매 비용</p>
                        <p className="text-3xl font-bold">
                          {results.capex.total_cost.toLocaleString('ko-KR')}원
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">월 감가상각비</p>
                        <p className="text-lg">
                          {results.capex.monthly_depreciation.toLocaleString('ko-KR')}원
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleQuoteRequest('capex')}
                      >
                        이 플랜으로 견적 요청
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Lease Card */}
                  <Card className={results.cheapest_option === 'lease' ? 'border-green-500 border-2' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">리스</CardTitle>
                        {results.cheapest_option === 'lease' && (
                          <Badge variant="default" className="bg-green-600">추천</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">월 리스료</p>
                        <p className="text-3xl font-bold">
                          {results.lease.monthly_payment.toLocaleString('ko-KR')}원
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">총 리스 비용</p>
                        <p className="text-lg">
                          {results.lease.total_cost.toLocaleString('ko-KR')}원
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">잔존가치</p>
                        <p className="text-sm">
                          {results.lease.residual_value.toLocaleString('ko-KR')}원
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleQuoteRequest('lease')}
                      >
                        이 플랜으로 견적 요청
                      </Button>
                    </CardContent>
                  </Card>

                  {/* RaaS Card */}
                  <Card className={results.cheapest_option === 'raas' ? 'border-green-500 border-2' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">RaaS (OPEX)</CardTitle>
                        {results.cheapest_option === 'raas' && (
                          <Badge variant="default" className="bg-green-600">추천</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">월 구독료</p>
                        <p className="text-3xl font-bold">
                          {results.raas.monthly_subscription.toLocaleString('ko-KR')}원
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">총 구독 비용</p>
                        <p className="text-lg">
                          {results.raas.total_cost.toLocaleString('ko-KR')}원
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">포함 서비스</p>
                        <ul className="text-xs space-y-0.5 mt-1">
                          {results.raas.included_services.slice(0, 3).map((service, i) => (
                            <li key={i}>• {service}</li>
                          ))}
                          {results.raas.included_services.length > 3 && (
                            <li>+{results.raas.included_services.length - 3}개 더보기</li>
                          )}
                        </ul>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleQuoteRequest('raas')}
                      >
                        이 플랜으로 견적 요청
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* TCO Comparison Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>총 소유 비용 (TCO) 비교</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={tcoData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => value.toLocaleString('ko-KR') + '원'}
                        />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" name="총 비용" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* ROI Line Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>누적 비용 추이 (ROI)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={roiData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" label={{ value: '개월', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => value.toLocaleString('ko-KR') + '원'}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="CAPEX" stroke="#ef4444" strokeWidth={2} name="CAPEX" />
                        <Line type="monotone" dataKey="Lease" stroke="#f59e0b" strokeWidth={2} name="Lease" />
                        <Line type="monotone" dataKey="RaaS" stroke="#3b82f6" strokeWidth={2} name="RaaS" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      {selectedModel && (
        <QuoteRequestModal
          open={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          selectedPlan={selectedPlan}
          robotModel={selectedModel.code}
          quantity={quantity}
          termMonths={termMonths}
        />
      )}
    </div>
  );
}
