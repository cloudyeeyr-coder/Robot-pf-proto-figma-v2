import { Menu } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { useAuth } from '../../../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const getRoleNavigation = () => {
    if (!user) return [];

    switch (user.role) {
      case 'buyer':
        return [
          { label: 'SI 검색', path: '/search' },
          { label: '계산기', path: '/calculator' },
          { label: '내 계약', path: '/my/contracts' },
          { label: 'AS 요청', path: '/my/as-tickets' },
          { label: '방문 예약', path: '/booking' },
        ];
      case 'si_partner':
        return [
          { label: '프로필', path: '/partner/profile' },
          { label: '제안서', path: '/partner/proposals' },
          { label: '인증 뱃지', path: '/partner/badges' },
        ];
      case 'manufacturer':
        return [
          { label: '대시보드', path: '/manufacturer/dashboard' },
          { label: '뱃지 관리', path: '/manufacturer/badges' },
          { label: '제안 관리', path: '/manufacturer/proposals' },
        ];
      case 'admin':
        return [
          { label: '대시보드', path: '/admin' },
          { label: '에스크로', path: '/admin/escrow' },
          { label: 'AS SLA', path: '/admin/as-sla' },
          { label: '이벤트', path: '/admin/events' },
        ];
      default:
        return [];
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="lg:hidden"
                aria-label="메뉴 열기"
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}

            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg" />
              <span className="font-bold text-lg hidden sm:inline">
                로봇 SI 매칭 플랫폼
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {getRoleNavigation().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown userId={user?.id || ''} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>프로필 설정</DropdownMenuItem>
                    <DropdownMenuItem>알림 설정</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>로그아웃</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => window.location.href = '/login'}>
                  로그인
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>회원가입</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.location.href = '/signup/buyer'}>
                      수요기업 가입
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/signup/partner'}>
                      SI 파트너 가입
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
