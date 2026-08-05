'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import ClassIcon from '@/components/ClassIcon';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig, type SiteConfig } from '@/lib/config-api';
import { getMuClassName } from '@/lib/mu-classes';
import {
  inputModern,
  btnPrimaryClass,
} from '@/lib/page-theme';

function DashRow({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="we-dash-row">
      <span className="we-dash-label">{label}</span>
      <span className={`we-dash-value ${valueClass}`.trim()}>{value}</span>
    </div>
  );
}

interface Character {
  name: string;
  level: number;
  class: number;
  className: string;
  resetCount: number;
  masterResetCount: number;
  stats: {
    strength: number;
    dexterity: number;
    vitality: number;
    energy: number;
    leadership: number;
  };
  life: number;
  maxLife: number;
  mana: number;
  maxMana: number;
  money: number;
  mapNumber: number;
  mapPosX: number;
  mapPosY: number;
  pkCount: number;
  pkLevel: number;
}

interface CharacterData {
  name: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  expProgress: number;
  class: number;
  strength: number;
  dexterity: number;
  vitality: number;
  energy: number;
  leadership: number;
  money: number;
  life: number;
  maxLife: number;
  mana: number;
  maxMana: number;
  mapNumber: number;
  mapPosX: number;
  mapPosY: number;
  pkCount: number;
  pkLevel: number;
  resetCount: number;
  masterResetCount: number;
  isOnline: boolean;
  connectTime: string;
  disconnectTime: string;
  totalPlayTime: number;
  playTimeHours: number;
  playTimeMinutes: number;
}

interface ResetData {
  dailyReset: number;
  weeklyReset: number;
  monthlyReset: number;
  lastDailyReset: string;
  lastWeeklyReset: string;
  lastMonthlyReset: string;
  masterDailyReset: number;
  masterWeeklyReset: number;
  masterMonthlyReset: number;
  lastMasterDailyReset: string;
  lastMasterWeeklyReset: string;
  lastMasterMonthlyReset: string;
  totalResetCount: number;
  totalMasterResetCount: number;
}

interface GuildData {
  name: string;
  master: string;
  score: number;
  memberCount: number;
}

interface DashboardData {
  account: {
    id: string;
    characterCount: number;
    level: number;
    levelName: string;
    levelColor: string;
    expireDate: string;
    isExpired: boolean;
  };
  character: CharacterData;
  reset: ResetData;
  warehouse: {
    money: number;
  };
  guild: GuildData | null;
}

// Dữ liệu mẫu khi backend chưa trả về hoặc lỗi
const SAMPLE_CHARACTER: Character = {
  name: 'AdminChar',
  level: 400,
  class: 50,
  className: 'Dark Lord',
  resetCount: 15,
  masterResetCount: 2,
  stats: { strength: 1200, dexterity: 800, vitality: 1000, energy: 600, leadership: 400 },
  life: 4500,
  maxLife: 5000,
  mana: 2000,
  maxMana: 2500,
  money: 5000000,
  mapNumber: 0,
  mapPosX: 130,
  mapPosY: 130,
  pkCount: 0,
  pkLevel: 3,
};

const SAMPLE_DASHBOARD: DashboardData = {
  account: {
    id: 'adminsse',
    characterCount: 1,
    level: 1,
    levelName: 'Đồng',
    levelColor: '#CD7F32',
    expireDate: '2079-06-06',
    isExpired: false,
  },
  character: {
    name: 'AdminChar',
    level: 400,
    experience: 8500000,
    nextLevelExp: 16000000,
    expProgress: 53,
    class: 50,
    strength: 1200,
    dexterity: 800,
    vitality: 1000,
    energy: 600,
    leadership: 400,
    money: 5000000,
    life: 4500,
    maxLife: 5000,
    mana: 2000,
    maxMana: 2500,
    mapNumber: 0,
    mapPosX: 130,
    mapPosY: 130,
    pkCount: 0,
    pkLevel: 3,
    resetCount: 15,
    masterResetCount: 2,
    isOnline: false,
    connectTime: '',
    disconnectTime: '',
    totalPlayTime: 7200,
    playTimeHours: 2,
    playTimeMinutes: 0,
  },
  reset: {
    dailyReset: 1,
    weeklyReset: 1,
    monthlyReset: 1,
    lastDailyReset: '2026-03-15',
    lastWeeklyReset: '2026-03-10',
    lastMonthlyReset: '2026-03-01',
    masterDailyReset: 0,
    masterWeeklyReset: 0,
    masterMonthlyReset: 0,
    lastMasterDailyReset: '',
    lastMasterWeeklyReset: '',
    lastMasterMonthlyReset: '',
    totalResetCount: 15,
    totalMasterResetCount: 2,
  },
  warehouse: { money: 1000000 },
  guild: { name: 'MuLegends', master: 'adminsse', score: 5000, memberCount: 5 },
};

export default function Dashboard() {
  const [user, setUser] = useState<{memb___id: string; memb_name: string} | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(siteConfigStatic as unknown as SiteConfig);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const config = await getSiteConfig();
      if (config) setSiteConfig(config);
    };
    load();
  }, []);

  const getClassName = (classId: number): string => getMuClassName(classId);

  const formatMoney = (money: number): string => {
    return new Intl.NumberFormat('vi-VN').format(money);
  };

  const formatText = (text: string | null | undefined): string => {
    if (!text) return '';
    // Giữ nguyên nếu là số hoặc có chữ số
    if (/^\d+$/.test(text) || /\d/.test(text)) {
      return text;
    }
    // Format title case: chữ cái đầu viết hoa, còn lại viết thường
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatAccountName = (name: string | null | undefined): string => {
    if (!name) return '';
    // Giữ nguyên nếu có số hoặc ký tự đặc biệt
    if (/\d/.test(name) || /[^a-zA-Z0-9]/.test(name)) {
      return name;
    }
    // Format: chữ cái đầu viết hoa, còn lại viết thường
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const formatTime = (hours: number, minutes: number): string => {
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const fetchCharacters = async (accountId: string) => {
    try {
      setCharactersLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/characters?accountId=${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      
      if (result.success && result.data?.characters?.length) {
        setCharacters(result.data.characters);
        setSelectedCharacter(result.data.characters[0]);
      } else {
        setCharacters([]);
        setSelectedCharacter(null);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      setCharacters([]);
      setSelectedCharacter(null);
    } finally {
      setCharactersLoading(false);
    }
  };

  const handleCharacterChange = (characterName: string) => {
    const character = characters.find(char => char.name === characterName);
    if (character) {
      setSelectedCharacter(character);
    }
  };

  const handleUpdateAccount = async (updateData: Record<string, string>) => {
    try {
      setUpdateLoading(true);
      const response = await fetch('/api/account/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: user?.memb___id,
          updateData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Cập nhật thông tin thành công!');
        setShowAccountModal(false);
        // Refresh user data
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const updatedUser = JSON.parse(userData);
          updatedUser.memb_name = updateData.memb_name || updatedUser.memb_name;
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Lỗi khi cập nhật thông tin');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      if (!user?.memb___id) {
        alert('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
        return;
      }

      setUpdateLoading(true);
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: user.memb___id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Đổi mật khẩu thành công!');
        setShowPasswordModal(false);
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Lỗi khi đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (!token || !userData) {
          router.push('/login');
          return;
        }
        
        // Parse user data để lấy account ID
        const parsedUser = JSON.parse(userData);
        const accountId = parsedUser.memb___id || parsedUser.username || parsedUser.accountId || parsedUser.id;
        
        if (!accountId) {
          console.error('Không tìm thấy account ID');
          router.push('/login');
          return;
        }
        
        console.log('Loading dashboard for account:', accountId);
        
        // Set user từ localStorage trước
        setUser({
          memb___id: accountId,
          memb_name: parsedUser.memb_name || parsedUser.username || parsedUser.characterName || accountId
        });
        
        // Fetch characters first
        await fetchCharacters(accountId);
        
        // Lấy thông tin dashboard từ API với account ID (khi lỗi dùng dữ liệu mẫu)
        try {
          const response = await fetch(`/api/dashboard?accountId=${accountId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'x-user-account': accountId
            }
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setDashboardData(result.data);
              if (result.data.account?.id) {
                setUser(prev => ({
                  memb___id: result.data.account.id,
                  memb_name: prev?.memb_name || result.data.account.id
                }));
              }
            } else {
              setDashboardData(null);
            }
          } else {
            setDashboardData(null);
          }
        } catch {
          setDashboardData(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  if (loading) {
    return (
      <SubPageLayout
        breadcrumbs={[{ label: 'Bảng điều khiển' }]}
        title="Bảng điều khiển"
        subtitle="Đang tải dữ liệu..."
        showSidebar={false}
      >
        <div className="we-loading-center"><div className="we-spinner" /></div>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout
      breadcrumbs={[{ label: 'Bảng điều khiển' }]}
      title="Bảng điều khiển"
      subtitle="Quản lý nhân vật và tài khoản game"
      showSidebar={false}
    >
        <div className="we-box we-dash-toolbar">
          <div className="we-box-body">
            <div className="we-dash-toolbar">
              <div className="we-dash-toolbar-user">
                Xin chào, <strong>{user?.memb_name || '—'}</strong>
              </div>
              {characters.length > 0 ? (
                <div className="we-dash-char-select">
                  <label htmlFor="dash-char">Nhân vật:</label>
                  <select
                    id="dash-char"
                    value={selectedCharacter?.name || ''}
                    onChange={(e) => handleCharacterChange(e.target.value)}
                    disabled={charactersLoading}
                    className={inputModern}
                    style={{ marginBottom: 0 }}
                  >
                    {characters.map((char) => (
                      <option key={char.name} value={char.name}>
                        {char.name} ({char.className}) — Cấp {char.level}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: '#b45309', margin: 0 }}>
                  Chưa tải được danh sách nhân vật. Thử đăng xuất và đăng nhập lại.
                </p>
              )}
              <div className="we-dash-toolbar-actions">
                <Link href="/myaccount" className="we-btn" style={{ padding: '8px 14px' }}>
                  Thông tin tài khoản
                </Link>
                <button type="button" onClick={() => setShowAccountModal(true)} className="we-btn" style={{ padding: '8px 14px' }}>
                  Quản lý
                </button>
                <button type="button" onClick={handleLogout} className="we-btn" style={{ padding: '8px 14px', borderColor: 'var(--we-red)', color: 'var(--we-red)' }}>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>


          <div className="we-dash-grid we-dash-grid--3">
            <div className="we-box">
              <div className="we-box-head">Thông tin tài khoản</div>
              <div className="we-box-body">
                <DashRow label="Tên đăng nhập" value={formatAccountName(user?.memb___id || dashboardData?.account?.id || '—')} valueClass="we-dash-value--accent" />
                <DashRow label="Nhân vật chính" value={formatAccountName(dashboardData?.character?.name || selectedCharacter?.name || 'Chưa có')} />
                <DashRow label="Số nhân vật" value={dashboardData?.account?.characterCount ?? characters.length ?? 0} />
                <div className="we-dash-row">
                  <span className="we-dash-label">Loại tài khoản</span>
                  <span className="we-dash-badge" style={{ backgroundColor: dashboardData?.account?.levelColor || '#ccc' }}>
                    {formatText(dashboardData?.account?.levelName || 'Thường')}
                  </span>
                </div>
                {dashboardData?.account?.expireDate && (
                  <DashRow
                    label="Hết hạn"
                    value={new Date(dashboardData.account.expireDate).toLocaleDateString('vi-VN')}
                    valueClass={dashboardData.account.isExpired ? 'we-dash-value--bad' : 'we-dash-value--ok'}
                  />
                )}
                <DashRow
                  label="Trạng thái"
                  value={dashboardData?.character?.isOnline ? 'Đang online' : 'Offline'}
                  valueClass={dashboardData?.character?.isOnline ? 'we-dash-value--ok' : 'we-dash-value--bad'}
                />
              </div>
            </div>

            <div className="we-box">
              <div className="we-box-head">Trạng thái game</div>
              <div className="we-box-body">
                <DashRow label="Máy chủ" value="Trực tuyến" valueClass="we-dash-value--ok" />
                <DashRow label="Cấp độ" value={selectedCharacter?.level ?? dashboardData?.character?.level ?? 0} />
                <DashRow
                  label="Lớp nhân vật"
                  value={
                    <span className="we-dash-class">
                      <ClassIcon classId={selectedCharacter?.class ?? dashboardData?.character?.class ?? 0} size={22} className="we-class-icon--inline" />
                      {formatText(selectedCharacter?.className || getClassName(dashboardData?.character?.class ?? 0))}
                    </span>
                  }
                />
                <DashRow
                  label="Kinh nghiệm"
                  value={`${formatMoney(dashboardData?.character?.experience ?? 0)} / ${formatMoney(dashboardData?.character?.nextLevelExp ?? 0)}`}
                />
                <div className="we-dash-progress we-dash-progress--exp">
                  <span style={{ width: `${dashboardData?.character?.expProgress ?? 0}%` }} />
                </div>
              </div>
            </div>

            <div className="we-box">
              <div className="we-box-head">Thống kê</div>
              <div className="we-box-body">
                <DashRow label="Thời gian chơi" value={formatTime(dashboardData?.character?.playTimeHours ?? 0, dashboardData?.character?.playTimeMinutes ?? 0)} />
                <DashRow label="Số lần PK" value={selectedCharacter?.pkCount ?? dashboardData?.character?.pkCount ?? 0} />
                <DashRow label="Cấp PK" value={selectedCharacter?.pkLevel ?? dashboardData?.character?.pkLevel ?? 0} />
                <DashRow
                  label="Vị trí"
                  value={`Map ${selectedCharacter?.mapNumber ?? dashboardData?.character?.mapNumber ?? 0} (${selectedCharacter?.mapPosX ?? dashboardData?.character?.mapPosX ?? 0}, ${selectedCharacter?.mapPosY ?? dashboardData?.character?.mapPosY ?? 0})`}
                />
              </div>
            </div>
          </div>

          <div className="we-dash-grid we-dash-grid--3">
            <div className="we-box">
              <div className="we-box-head">Chỉ số nhân vật</div>
              <div className="we-box-body">
                <DashRow label="Sức mạnh" value={selectedCharacter?.stats?.strength ?? dashboardData?.character?.strength ?? 0} valueClass="we-dash-value--gold" />
                <DashRow label="Nhanh nhẹn" value={selectedCharacter?.stats?.dexterity ?? dashboardData?.character?.dexterity ?? 0} valueClass="we-dash-value--accent" />
                <DashRow label="Thể lực" value={selectedCharacter?.stats?.vitality ?? dashboardData?.character?.vitality ?? 0} valueClass="we-dash-value--bad" />
                <DashRow label="Năng lượng" value={selectedCharacter?.stats?.energy ?? dashboardData?.character?.energy ?? 0} />
                <DashRow label="Chỉ huy" value={selectedCharacter?.stats?.leadership ?? dashboardData?.character?.leadership ?? 0} valueClass="we-dash-value--gold" />
                <DashRow label="Cấp độ" value={selectedCharacter?.level ?? dashboardData?.character?.level ?? 0} valueClass="we-dash-value--ok" />
                <DashRow
                  label="Lớp nhân vật"
                  value={
                    <span className="we-dash-class">
                      <ClassIcon classId={selectedCharacter?.class ?? dashboardData?.character?.class ?? 0} size={22} className="we-class-icon--inline" />
                      {formatText(selectedCharacter?.className || getClassName(dashboardData?.character?.class ?? 0))}
                    </span>
                  }
                />
                <DashRow label="Số lần PK" value={selectedCharacter?.pkCount ?? dashboardData?.character?.pkCount ?? 0} />
                <DashRow label="Cấp PK" value={selectedCharacter?.pkLevel ?? dashboardData?.character?.pkLevel ?? 0} />
                <DashRow label="Số Reset" value={selectedCharacter?.resetCount ?? dashboardData?.character?.resetCount ?? 0} valueClass="we-dash-value--accent" />
                <DashRow label="Master Reset" value={selectedCharacter?.masterResetCount ?? dashboardData?.character?.masterResetCount ?? 0} />
              </div>
            </div>

            <div className="we-box">
              <div className="we-box-head">HP & MP</div>
              <div className="we-box-body">
                <DashRow
                  label="Máu (HP)"
                  value={`${Math.floor(selectedCharacter?.life ?? dashboardData?.character?.life ?? 0)} / ${Math.floor(selectedCharacter?.maxLife ?? dashboardData?.character?.maxLife ?? 0)}`}
                />
                <div className="we-dash-progress we-dash-progress--hp">
                  <span style={{ width: `${Math.min(100, ((selectedCharacter?.life ?? dashboardData?.character?.life ?? 0) / (selectedCharacter?.maxLife ?? dashboardData?.character?.maxLife ?? 1)) * 100)}%` }} />
                </div>
                <DashRow
                  label="Mana (MP)"
                  value={`${Math.floor(selectedCharacter?.mana ?? dashboardData?.character?.mana ?? 0)} / ${Math.floor(selectedCharacter?.maxMana ?? dashboardData?.character?.maxMana ?? 0)}`}
                />
                <div className="we-dash-progress we-dash-progress--mp">
                  <span style={{ width: `${Math.min(100, ((selectedCharacter?.mana ?? dashboardData?.character?.mana ?? 0) / (selectedCharacter?.maxMana ?? dashboardData?.character?.maxMana ?? 1)) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="we-box">
              <div className="we-box-head">Tiền tệ</div>
              <div className="we-box-body">
                <DashRow label="Tiền nhân vật" value={`${formatMoney(selectedCharacter?.money ?? dashboardData?.character?.money ?? 0)} Zen`} valueClass="we-dash-value--ok" />
                <DashRow label="Tiền kho" value={`${formatMoney(dashboardData?.warehouse?.money ?? 0)} Zen`} valueClass="we-dash-value--ok" />
              </div>
            </div>
          </div>

          <div className="we-box">
            <div className="we-box-head">Reset</div>
            <div className="we-box-body">
              <div className="we-dash-grid we-dash-grid--3">
                <div className="we-dash-subcard">
                  <h4>Reset thường</h4>
                  <DashRow label="Hàng ngày" value={dashboardData?.reset?.dailyReset ?? 0} />
                  <DashRow label="Hàng tuần" value={dashboardData?.reset?.weeklyReset ?? 0} />
                  <DashRow label="Hàng tháng" value={dashboardData?.reset?.monthlyReset ?? 0} />
                  <DashRow label="Tổng" value={dashboardData?.reset?.totalResetCount ?? 0} valueClass="we-dash-value--accent" />
                </div>

                <div className="we-dash-subcard">
                  <h4>Master Reset</h4>
                  <DashRow label="Hàng ngày" value={dashboardData?.reset?.masterDailyReset ?? 0} />
                  <DashRow label="Hàng tuần" value={dashboardData?.reset?.masterWeeklyReset ?? 0} />
                  <DashRow label="Hàng tháng" value={dashboardData?.reset?.masterMonthlyReset ?? 0} />
                  <DashRow label="Tổng" value={dashboardData?.reset?.totalMasterResetCount ?? 0} valueClass="we-dash-value--accent" />
                </div>

                <div className="we-dash-subcard">
                  <h4>Lần reset gần nhất</h4>
                  {dashboardData?.reset?.lastDailyReset && (
                    <DashRow label="Hàng ngày" value={new Date(dashboardData.reset.lastDailyReset).toLocaleDateString('vi-VN')} valueClass="we-dash-value--ok" />
                  )}
                  {dashboardData?.reset?.lastWeeklyReset && (
                    <DashRow label="Hàng tuần" value={new Date(dashboardData.reset.lastWeeklyReset).toLocaleDateString('vi-VN')} valueClass="we-dash-value--ok" />
                  )}
                  {dashboardData?.reset?.lastMonthlyReset && (
                    <DashRow label="Hàng tháng" value={new Date(dashboardData.reset.lastMonthlyReset).toLocaleDateString('vi-VN')} valueClass="we-dash-value--ok" />
                  )}
                  {!dashboardData?.reset?.lastDailyReset && !dashboardData?.reset?.lastWeeklyReset && !dashboardData?.reset?.lastMonthlyReset && (
                    <p style={{ fontSize: 13, color: '#999', margin: 0 }}>Chưa có dữ liệu reset</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {dashboardData?.guild && (
            <div className="we-box">
              <div className="we-box-head">Thông tin Guild</div>
              <div className="we-box-body">
                <div className="we-dash-grid we-dash-grid--2">
                  <DashRow label="Tên Guild" value={dashboardData.guild.name} />
                  <DashRow label="Chủ Guild" value={dashboardData.guild.master} />
                  <DashRow label="Điểm số" value={formatMoney(dashboardData.guild.score)} valueClass="we-dash-value--accent" />
                  <DashRow label="Thành viên" value={dashboardData.guild.memberCount} />
                </div>
              </div>
            </div>
          )}

      {showAccountModal && (
        <div className="we-dash-modal-backdrop">
          <div className="we-dash-modal">
            <h3>Quản lý tài khoản</h3>
            <div className="space-y-3">
              <div>
                <label className="we-dash-label" style={{ display: 'block', marginBottom: 6 }}>Tên hiển thị</label>
                <input type="text" defaultValue={user?.memb_name || ''} id="memb_name" className={inputModern} style={{ marginBottom: 0 }} />
              </div>
              <div>
                <label className="we-dash-label" style={{ display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" id="mail_addr" className={inputModern} style={{ marginBottom: 0 }} />
              </div>
              <div>
                <label className="we-dash-label" style={{ display: 'block', marginBottom: 6 }}>Số điện thoại</label>
                <input type="tel" id="phon_numb" className={inputModern} style={{ marginBottom: 0 }} />
              </div>
              <div className="we-dash-modal-actions">
                <button type="button" onClick={() => { const updateData = { memb_name: (document.getElementById('memb_name') as HTMLInputElement)?.value, mail_addr: (document.getElementById('mail_addr') as HTMLInputElement)?.value, phon_numb: (document.getElementById('phon_numb') as HTMLInputElement)?.value }; handleUpdateAccount(updateData); }} disabled={updateLoading} className={`${btnPrimaryClass}`} style={{ flex: 1 }}>{updateLoading ? 'Đang cập nhật...' : 'Cập nhật'}</button>
                <button type="button" onClick={() => { setShowAccountModal(false); setShowPasswordModal(true); }} className="we-btn" style={{ flex: 1 }}>Đổi mật khẩu</button>
              </div>
              <button type="button" onClick={() => setShowAccountModal(false)} className="we-btn we-btn-block">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="we-dash-modal-backdrop">
          <div className="we-dash-modal">
            <h3>Đổi mật khẩu</h3>
            <div className="space-y-3">
              <div>
                <label className="we-dash-label" style={{ display: 'block', marginBottom: 6 }}>Mật khẩu hiện tại</label>
                <input type="password" id="currentPassword" className={inputModern} style={{ marginBottom: 0 }} />
              </div>
              <div>
                <label className="we-dash-label" style={{ display: 'block', marginBottom: 6 }}>Mật khẩu mới</label>
                <input type="password" id="newPassword" className={inputModern} style={{ marginBottom: 0 }} />
              </div>
              <div>
                <label className="we-dash-label" style={{ display: 'block', marginBottom: 6 }}>Xác nhận mật khẩu mới</label>
                <input type="password" id="confirmPassword" className={inputModern} style={{ marginBottom: 0 }} />
              </div>
              <div className="we-dash-modal-actions">
                <button type="button" onClick={() => { const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement)?.value; const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value; const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value; if (newPassword !== confirmPassword) { alert('Mật khẩu xác nhận không khớp!'); return; } handleChangePassword({ currentPassword, newPassword }); }} disabled={updateLoading} className={`${btnPrimaryClass}`} style={{ flex: 1 }}>{updateLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}</button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="we-btn" style={{ flex: 1 }}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SubPageLayout>
  );
}
