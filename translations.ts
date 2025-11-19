
export type Language = 'en' | 'zh-TW';

export const translations = {
  en: {
    appTitle: "INSpark Daily",
    addZoneBtn: "Add Zone",
    noZones: "No zones configured.",
    createFirstZone: "Create your first News Zone",
    
    // Navigation
    home: "Home",
    myZones: "My Zones",
    settings: "Settings",
    manageSources: "Manage Sources",

    // Feed
    trending: "Trending Now",
    justIn: "Just In",
    readMore: "Read More",
    featured: "Featured Story",
    
    // Zone Management (New)
    addZoneTitle: "Add New Zone",
    editZoneTitle: "Edit Zone",
    zoneTitleLabel: "Zone Title",
    zoneTitlePlaceholder: "e.g., Crypto News, Local Sports",
    sourcesLabel: "Manage Sources",
    sourcesHelp: "Add specific websites to track. Provide a name and URL.",
    sourceNameLabel: "Source Name",
    sourceNamePlaceholder: "e.g., TechCrunch",
    sourceUrlLabel: "Source URL",
    sourceUrlPlaceholder: "https://techcrunch.com",
    addSourceBtn: "Add Source",
    noSourcesAdded: "No sources added yet.",
    cancel: "Cancel",
    createZone: "Create Zone",
    updateZone: "Update Zone",
    
    // ZoneCard/Feed
    refresh: "Refresh",
    deleteZone: "Delete Zone",
    editZone: "Edit Zone",
    sources: "Sources:",
    noNews: "No news available.",
    tryAgain: "Try Again",
    loading: "Loading...",
    errorFetch: "Failed to fetch latest news.",
    confirmDelete: "Are you sure you want to remove this zone?",

    // Settings
    settingsTitle: "Settings",
    schedule: "Daily Digest Settings",
    enableDigest: "Enable Daily Digest",
    deliveryTime: "Delivery Time",
    recipientEmail: "Recipient Email",
    emailPlaceholder: "your-email@example.com",
    testFunc: "Test Functionality",
    simulateBtn: "Simulate Daily Briefing Now",
    generating: "Generating Summary...",
    testDesc: "Uses Gemini to aggregate news from your active zones and generates the email body that would be sent via the backend.",
    saveSettings: "Save Settings",
    previewTitle: "Daily Briefing Preview",
    
    // Footer
    footerSlogan: "Your minimalist news hub. Aggregate, organize, and focus on the stories that matter most.",
    officialWebsite: "Official Website",
  },
  'zh-TW': {
    appTitle: "INSpark Daily",
    addZoneBtn: "新增專區",
    noZones: "尚未設定任何新聞專區。",
    createFirstZone: "建立您的第一個新聞專區",
    
    // Navigation
    home: "首頁",
    myZones: "我的專區",
    settings: "設定",
    manageSources: "管理來源",

    // Feed
    trending: "熱門趨勢",
    justIn: "最新快訊",
    readMore: "閱讀更多",
    featured: "精選報導",
    
    // Zone Management (New)
    addZoneTitle: "新增新聞專區",
    editZoneTitle: "編輯專區",
    zoneTitleLabel: "專區標題",
    zoneTitlePlaceholder: "例如：加密貨幣、體育新聞",
    sourcesLabel: "管理來源",
    sourcesHelp: "新增欲追蹤的網站。請提供名稱與網址。",
    sourceNameLabel: "來源名稱",
    sourceNamePlaceholder: "例如：科技新報",
    sourceUrlLabel: "來源網址",
    sourceUrlPlaceholder: "https://technews.tw",
    addSourceBtn: "新增來源",
    noSourcesAdded: "尚未新增來源。",
    cancel: "取消",
    createZone: "建立專區",
    updateZone: "更新專區",
    
    // ZoneCard/Feed
    refresh: "重新整理",
    deleteZone: "刪除專區",
    editZone: "編輯專區",
    sources: "新聞來源：",
    noNews: "目前沒有相關新聞。",
    tryAgain: "再試一次",
    loading: "載入中...",
    errorFetch: "無法取得最新新聞。",
    confirmDelete: "確定要刪除此專區嗎？",

    // Settings
    settingsTitle: "設定",
    schedule: "每日摘要設定",
    enableDigest: "啟用每日摘要",
    deliveryTime: "發送時間",
    recipientEmail: "接收信箱",
    emailPlaceholder: "您的電子郵件@example.com",
    testFunc: "功能測試",
    simulateBtn: "立即模擬每日摘要",
    generating: "正在產生摘要...",
    testDesc: "使用 Gemini 匯聚您活躍專區的新聞，並模擬後端將發送的電子郵件內容。",
    saveSettings: "儲存設定",
    previewTitle: "每日摘要預覽",

    // Footer
    footerSlogan: "您的極簡新聞中心。匯聚、整理並專注於最重要的故事。",
    officialWebsite: "官方網站",
  }
};