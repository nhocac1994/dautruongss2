export interface EventFormItem {
  id: number;
  name: string;
  color: string;
  scheduleType: 'hourly' | 'specific';
  interval: number;
  startMinute: number;
  duration: number;
  times: string;
}

export interface ConfigFormState {
  nameGame: string;
  gameTitle: string;
  gameSubtitle: string;
  serverName: string;
  serverVersion: string;
  phone: string;
  email: string;
  address: string;
  websiteUrl: string;
  websiteName: string;
  expRate: string;
  dropRate: string;
  mediafire: string;
  mega: string;
  clientVersion: string;
  facebook: string;
  youtube: string;
  discord: string;
  zalo: string;
  tiktok: string;
  accountNumber: string;
  accountHolder: string;
  bankName: string;
  qrCodeUrl: string;
  /** Cộng vào số thật DB khi hiển thị sidebar */
  boostAccounts: number;
  boostCharacters: number;
  boostGuilds: number;
  boostOnline: number;
  events: EventFormItem[];
}

export const emptyConfigForm = (): ConfigFormState => ({
  nameGame: 'MUDAUTRUONGSS1.NET',
  gameTitle: 'Mu Online Season 1.0',
  gameSubtitle: 'Bản chuẩn Season 1.0 — Không hạ cấp',
  serverName: 'MUDAUTRUONGSS1.NET',
  serverVersion: 'Season 1.0',
  phone: '',
  email: '',
  address: 'Việt Nam',
  websiteUrl: 'https://mudautruongss1.net',
  websiteName: 'MUDAUTRUONGSS1.NET',
  expRate: 'x50',
  dropRate: '90%',
  mediafire: '',
  mega: '',
  clientVersion: 'Season 1.0',
  facebook: '',
  youtube: '',
  discord: '',
  zalo: '',
  tiktok: '',
  accountNumber: '',
  accountHolder: '',
  bankName: '',
  qrCodeUrl: '',
  boostAccounts: 0,
  boostCharacters: 0,
  boostGuilds: 0,
  boostOnline: 0,
  events: [],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function configToFormState(raw: Record<string, any>): ConfigFormState {
  const sm = raw.socialMedia ?? {};
  const dl = raw.downloadLinks ?? {};
  const bank = raw.bankTransfer ?? {};
  const si = raw.serverInfo ?? {};
  const boost = raw.statsBoost ?? {};
  const events: EventFormItem[] = (raw.events ?? []).map((e: Record<string, unknown>) => {
    const sch = (e.schedule ?? {}) as Record<string, unknown>;
    const type = sch.type === 'specific' ? 'specific' : 'hourly';
    const timesArr = Array.isArray(sch.times) ? (sch.times as string[]) : [];
    return {
      id: Number(e.id ?? 0),
      name: String(e.name ?? ''),
      color: String(e.color ?? '#9333ea'),
      scheduleType: type,
      interval: Number(sch.interval ?? 2),
      startMinute: Number(sch.startMinute ?? 0),
      duration: Number(sch.duration ?? 10),
      times: timesArr.join(', '),
    };
  });

  return {
    nameGame: String(raw.nameGame ?? 'MUDAUTRUONGSS1.NET'),
    gameTitle: String(raw.gameTitle ?? 'Mu Online Season 1.0'),
    gameSubtitle: String(raw.gameSubtitle ?? 'Bản chuẩn Season 1.0 — Không hạ cấp'),
    serverName: String(raw.serverName ?? raw.nameGame ?? 'MUDAUTRUONGSS1.NET'),
    serverVersion: String(raw.serverVersion ?? 'Season 1.0'),
    phone: String(raw.phone ?? ''),
    email: String(raw.email ?? ''),
    address: String(raw.address ?? ''),
    websiteUrl: String(raw.websiteUrl ?? ''),
    websiteName: String(raw.websiteName ?? 'MUDAUTRUONGSS1.NET'),
    expRate: String(si.expRate ?? raw.expRate ?? 'x50'),
    dropRate: String(si.dropRate ?? raw.dropRate ?? '90%'),
    mediafire: String(dl.mediafire ?? ''),
    mega: String(dl.mega ?? ''),
    clientVersion: String(dl.clientVersion ?? 'Season 1.0'),
    facebook: String(sm.facebook ?? raw.linkFacebook ?? ''),
    youtube: String(sm.youtube ?? raw.linkYoutube ?? ''),
    discord: String(sm.discord ?? raw.linkDiscord ?? ''),
    zalo: String(sm.zalo ?? raw.linkZalo ?? ''),
    tiktok: String(sm.tiktok ?? raw.linkTikTok ?? ''),
    accountNumber: String(bank.accountNumber ?? ''),
    accountHolder: String(bank.accountHolder ?? ''),
    bankName: String(bank.bankName ?? ''),
    qrCodeUrl: String(bank.qrCodeUrl ?? ''),
    boostAccounts: Number(boost.totalAccounts ?? 0) || 0,
    boostCharacters: Number(boost.totalCharacters ?? 0) || 0,
    boostGuilds: Number(boost.totalGuilds ?? 0) || 0,
    boostOnline: Number(boost.onlinePlayers ?? 0) || 0,
    events,
  };
}

export function formStateToConfig(form: ConfigFormState): Record<string, unknown> {
  const serverName = form.serverName || form.nameGame;
  return {
    nameGame: form.nameGame,
    gameTitle: form.gameTitle,
    gameSubtitle: form.gameSubtitle,
    serverName,
    serverVersion: form.serverVersion,
    phone: form.phone,
    email: form.email,
    address: form.address,
    websiteUrl: form.websiteUrl,
    websiteName: form.websiteName || serverName,
    events: form.events.map((e) => {
      const schedule =
        e.scheduleType === 'specific'
          ? {
              type: 'specific',
              times: e.times
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
              duration: e.duration,
            }
          : {
              type: 'hourly',
              interval: e.interval,
              startMinute: e.startMinute,
              duration: e.duration,
            };
      return { id: e.id, name: e.name, schedule, color: e.color };
    }),
    downloadLinks: {
      mediafire: form.mediafire,
      mega: form.mega,
      clientVersion: form.clientVersion,
    },
    socialMedia: {
      facebook: form.facebook,
      youtube: form.youtube,
      discord: form.discord,
      zalo: form.zalo,
      tiktok: form.tiktok,
    },
    linkFacebook: form.facebook,
    linkYoutube: form.youtube,
    linkDiscord: form.discord,
    linkZalo: form.zalo,
    linkTikTok: form.tiktok,
    bankTransfer: {
      accountNumber: form.accountNumber,
      accountHolder: form.accountHolder,
      bankName: form.bankName,
      qrCodeUrl: form.qrCodeUrl,
    },
    serverInfo: {
      name: serverName,
      version: form.serverVersion,
      expRate: form.expRate,
      dropRate: form.dropRate,
    },
    statsBoost: {
      totalAccounts: Math.max(0, Math.floor(Number(form.boostAccounts) || 0)),
      totalCharacters: Math.max(0, Math.floor(Number(form.boostCharacters) || 0)),
      totalGuilds: Math.max(0, Math.floor(Number(form.boostGuilds) || 0)),
      onlinePlayers: Math.max(0, Math.floor(Number(form.boostOnline) || 0)),
    },
  };
}

export function newEventItem(): EventFormItem {
  return {
    id: Date.now() % 100000,
    name: 'Sự kiện mới',
    color: '#9333ea',
    scheduleType: 'hourly',
    interval: 2,
    startMinute: 0,
    duration: 10,
    times: '12:00, 20:00',
  };
}
