export type Language = 'ar' | 'en';

export interface Translations {
  appName: string;
  appSub: string;
  activeTenant: string;
  rlsActive: string;
  langToggle: string;

  // Tabs
  navForms: string;
  navDashboard: string;
  navTenants: string;
  navWorkflows: string;
  navSql: string;
  navBackend: string;
  navHybrid: string;
  pendingBadge: string;
  formsBadge: string;

  // Hybrid Deployment & Docker
  hybridTitle: string;
  hybridSub: string;
  deploymentModeLabel: string;
  modeCloud: string;
  modeOnPremise: string;
  modeCloudDesc: string;
  modeOnPremiseDesc: string;
  licenseCardTitle: string;
  licenseValid: string;
  licenseExpired: string;
  licenseCompany: string;
  licenseExpiryDate: string;
  licenseKeyInput: string;
  validateLicenseBtn: string;
  dockerTabCompose: string;
  dockerTabDockerfile: string;
  dockerTabMiddleware: string;
  dockerTabHrSap: string;
  onPremiseActiveBanner: string;
  onPremiseSwitchNotice: string;
  copyDockerBtn: string;
  copiedDockerBtn: string;
  singleTenantLocalNotice: string;

  // Client Preview Mode (Easter Egg)
  previewModeBanner: string;
  previewModeActive: string;
  previewModeDesc: string;
  previewModeExitBtn: string;
  previewModeReadOnlyHint: string;
  secretClickHint: string;

  // Footer
  footerTitle: string;
  footerSharedDb: string;
  footerJsonb: string;
  footerLatency: string;

  // Dynamic Form Studio / Builder
  formStudioTitle: string;
  formStudioSub: string;
  newTemplateBtn: string;
  saveVersionBtn: string;
  savedSuccess: string;
  tabVisualBuilder: string;
  tabLiveRenderer: string;
  tabJsonbSchema: string;
  templateConfig: string;
  formTitleLabel: string;
  entityTypeLabel: string;
  moduleAssocLabel: string;
  descLabel: string;
  addDynamicField: string;
  addDynamicFieldDesc: string;
  fieldCount: string;
  removeField: string;
  fieldLabel: string;
  jsonbKey: string;
  placeholderText: string;
  requiredCheck: string;
  fullWidthCheck: string;
  dropdownOptions: string;
  fieldTypes: {
    text: string;
    number: string;
    currency: string;
    date: string;
    select: string;
    boolean: string;
    textarea: string;
  };

  // Form Renderer
  moduleLabel: string;
  entityLabel: string;
  tenantLabel: string;
  selectOptionDefault: string;
  yesEnabled: string;
  noDisabled: string;
  resetForm: string;
  cancelBtn: string;
  submitEntryBtn: string;
  persistingBtn: string;
  submissionSuccess: string;
  validationErrorAlert: string;
  jsonbInspectorTitle: string;
  ginIndexed: string;
  requiredFieldError: string;
  numericError: string;
  minimumValueError: string;

  // Executive Dashboard
  execTitle: string;
  execSub: string;
  activePlan: string;
  dbLatency: string;
  kpiApInvoices: string;
  kpiAssetsValue: string;
  kpiHeadcount: string;
  kpiWorkflowSla: string;
  acrossActiveGl: string;
  registeredJsonb: string;
  retentionRate: string;
  pendingGates: string;
  moduleInactive: string;
  moduleMatrixTitle: string;
  recentRecordsTitle: string;
  recentRecordsSub: string;

  // Tenant Manager
  tenantManagerTitle: string;
  tenantManagerSub: string;
  currentEnterpriseTenant: string;
  subTier: string;
  tenantUuid: string;
  storageQuota: string;
  storageConsumed: string;
  seatUtil: string;
  seatProvisioned: string;
  moduleTogglesTitle: string;
  moduleTogglesSub: string;
  testRouteBtn: string;
  middlewareAuthResult: string;

  // Workflows
  workflowTitle: string;
  workflowSub: string;
  createTaskBtn: string;
  activeWorkflowsTitle: string;
  linkedDynamicEntities: string;
  slaHours: string;
  roleRequired: string;
  deptTasksQueue: string;
  deptTasksQueueSub: string;
  allDepts: string;
  allStatuses: string;
  approveBtn: string;
  rejectBtn: string;
  markCompleteBtn: string;
  signedOffStatus: string;
  declinedStatus: string;
  modalCreateTitle: string;
  taskTitleInput: string;
  priorityLevel: string;
  dueDateLabel: string;
  saveTaskBtn: string;
  priorities: {
    urgent: string;
    high: string;
    medium: string;
    low: string;
  };
  statuses: {
    pending: string;
    in_progress: string;
    approved: string;
    completed: string;
    rejected: string;
  };

  // Modules names
  modules: {
    finance: string;
    hr: string;
    operations: string;
    tasks: string;
    analytics: string;
  };

  // SQL Architecture
  sqlTitle: string;
  sqlSub: string;
  tabCore: string;
  tabDynamicForms: string;
  tabWorkflows: string;
  tabRls: string;
  tabEav: string;
  copySqlBtn: string;
  copiedSqlBtn: string;
  eavTitle: string;
  eavIntro: string;

  // Backend / API Simulator
  backendTitle: string;
  backendSub: string;
  tabMiddlewareCode: string;
  tabControllerCode: string;
  sandboxTitle: string;
  targetTenant: string;
  requiredModuleGuard: string;
  payloadLabel: string;
  dispatchBtn: string;
  executingBtn: string;
  terminalLogs: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    appName: 'عزوتي - EZWATY ERP',
    appSub: 'بنية سحابية ومحلية هجينة • محرك نماذج JSONB ديناميكي',
    activeTenant: 'المستأجر النشط:',
    rlsActive: 'أمان RLS مفعل',
    langToggle: 'English',

    // Tabs
    navForms: 'استوديو النماذج الديناميكية',
    navDashboard: 'لوحة القيادة التنفيذية',
    navTenants: 'المستأجرين والاشتراكات (A La Carte)',
    navWorkflows: 'سير العمل والمهام',
    navSql: 'بنية قواعد بيانات PostgreSQL',
    navBackend: 'منطق الواجهة الخلفية و Express API',
    navHybrid: 'الاستضافة الهجينة و Docker',
    pendingBadge: 'معلق',
    formsBadge: 'نماذج',

    // Hybrid Deployment & Docker
    hybridTitle: 'إعدادات الاستضافة الهجينة وحاويات Docker',
    hybridSub: 'التبديل بين النمط السحابي متعدد المستأجرين (Cloud Multi-Tenant) والنمط المحلي لمستأجر واحد (On-Premise Single-Tenant) بنفس الكود البرمجي',
    deploymentModeLabel: 'نمط الاستضافة النشط (DEPLOYMENT_MODE):',
    modeCloud: 'سحابي متعدد المستأجرين (Cloud SaaS)',
    modeOnPremise: 'محلي خادم منفرد (On-Premise Server)',
    modeCloudDesc: 'عزل صارم للبيانات عبر معرّف المستأجر (tenant_id) وسياسات أمان PostgreSQL RLS واشتراكات مجزأة.',
    modeOnPremiseDesc: 'تنفيذ محلي فائق السرعة، تجاوز فحوصات المستأجرين، تحويل الاستعلامات للمستأجر المحلي، وفحص مفتاح الترخيص المشفر.',
    licenseCardTitle: 'حالة ترخيص الخادم المحلي (On-Premise License)',
    licenseValid: 'الترخيص سارٍ ومعتمد محلياً',
    licenseExpired: 'الترخيص منتهي الصلاحية أو غير صالح',
    licenseCompany: 'الجهة المرخص لها:',
    licenseExpiryDate: 'تاريخ انتهاء الترخيص:',
    licenseKeyInput: 'مفتاح الترخيص المشفر (License Key):',
    validateLicenseBtn: 'التحقق من صحة الترخيص',
    dockerTabCompose: 'ملف docker-compose.yml',
    dockerTabDockerfile: 'ملف Dockerfile',
    dockerTabMiddleware: 'وسيط Express الهجين',
    dockerTabHrSap: 'تكييف HR & SAP مع النمطين',
    onPremiseActiveBanner: 'أنت الآن تعمل في نمط الخادم المحلي (On-Premise). تم تحويل كافة الاستعلامات للمستأجر المنفرد وتفعيل وسيط التراخيص.',
    onPremiseSwitchNotice: 'تم إخفاء أزرار ترقية الباقة السحابية وتبديل المستأجرين لتوافق بيئة الخادم المحلي المستقل.',
    copyDockerBtn: 'نسخ إعدادات Docker',
    copiedDockerBtn: 'تم نسخ كود Docker!',
    singleTenantLocalNotice: 'مستأجر محلي منفرد (ID: 00000000-0000-0000-0000-000000000001)',

    // Client Preview Mode (Easter Egg)
    previewModeBanner: 'نمط معاينة العميل نشط (للقراءة فقط)',
    previewModeActive: 'معاينة تجربة الموظف / العميل',
    previewModeDesc: 'تم إخفاء أدوات الإدارة، مخططات JSONB، وقوائم التعديل بالكامل. الحقول للقراءة فقط دون إمكانية إرسال أو تعديل البيانات.',
    previewModeExitBtn: 'الخروج من نمط المعاينة',
    previewModeReadOnlyHint: 'هذا الحقل للعرض فقط في نمط المعاينة الآمنة',
    secretClickHint: 'انقر 5 مرات متتالية على الشعار للتبديل السريع لنمط معاينة العميل (Easter Egg)',

    // Footer
    footerTitle: 'نظام عزوتي لإدارة الموارد المؤسسية (EZWATY ERP)',
    footerSharedDb: 'قاعدة بيانات مشتركة مع أمان على مستوى الصفوف (RLS)',
    footerJsonb: 'فهرسة سريعة عبر JSONB GIN',
    footerLatency: 'زمن الاستجابة: 1.8 مللي ثانية',

    // Dynamic Form Studio / Builder
    formStudioTitle: 'استوديو المخطط الديناميكي وبناء النماذج',
    formStudioSub: 'تخصيص تخطيط وحقول النماذج لكل شركة مستأجرة فورياً بدون تعديل جداول SQL أو فترات توقف',
    newTemplateBtn: 'قالب جديد',
    saveVersionBtn: 'حفظ الإصدار',
    savedSuccess: 'تم الحفظ في قاعدة البيانات!',
    tabVisualBuilder: 'محرر النماذج المرئي',
    tabLiveRenderer: 'عارض النماذج المباشر والتجربة',
    tabJsonbSchema: 'مخطط JSONB التخزيني في PostgreSQL',
    templateConfig: 'إعدادات القالب المؤسسي',
    formTitleLabel: 'عنوان النموذج',
    entityTypeLabel: 'نوع الكيان (Entity Type Discriminator)',
    moduleAssocLabel: 'الوحدة المرتبطة',
    descLabel: 'الوصف التفصيلي',
    addDynamicField: 'إضافة حقل ديناميكي جديد',
    addDynamicFieldDesc: 'انقر على نوع الحقل لإضافته فورياً إلى نموذج الشركة المستأجرة:',
    fieldCount: 'الحقول المرتبة: تنعكس التغييرات مباشرة في عمود JSONB',
    removeField: 'حذف الحقل',
    fieldLabel: 'تسمية الحقل (Label)',
    jsonbKey: 'مفتاح التخزين في JSONB',
    placeholderText: 'النص التوضيحي (Placeholder)',
    requiredCheck: 'إلزامي',
    fullWidthCheck: 'عرض كامل (عمودين)',
    dropdownOptions: 'خيارات القائمة المنسدلة (JSON):',
    fieldTypes: {
      text: 'حقل نصي',
      number: 'رقمي',
      currency: 'مبلغ مالي ($)',
      date: 'تاريخ',
      select: 'قائمة منسدلة',
      boolean: 'مفتاح منطقي (نعم/لا)',
      textarea: 'نص متعدد الأسطر',
    },

    // Form Renderer
    moduleLabel: 'الوحدة:',
    entityLabel: 'الكيان:',
    tenantLabel: 'المستأجر:',
    selectOptionDefault: '-- يرجى الاختيار --',
    yesEnabled: 'نعم / مفعّل',
    noDisabled: 'لا / معطّل',
    resetForm: 'إعادة ضبط الحقول',
    cancelBtn: 'إلغاء',
    submitEntryBtn: 'حفظ الإدخال في قاعدة البيانات',
    persistingBtn: 'جارٍ الحفظ في عمود JSONB...',
    submissionSuccess: 'تم حفظ السجل بنجاح في جدول entity_records داخل PostgreSQL عبر عمود JSONB',
    validationErrorAlert: 'يرجى مراجعة وتصحيح الأخطاء الموضحة أدناه.',
    jsonbInspectorTitle: 'عمود PostgreSQL JSONB الفوري:',
    ginIndexed: 'مفهرس عبر GIN',
    requiredFieldError: 'هذا الحقل إلزامي.',
    numericError: 'يجب إدخال قيمة رقمية صحيحة.',
    minimumValueError: 'أقل قيمة مسموح بها هي',

    // Executive Dashboard
    execTitle: 'لوحة القيادة والتحليلات التنفيذية الشاملة',
    execSub: 'مؤشرات أداء مجمعة وفورية تستعلم من جداول JSONB ومحركات تدفق العمل عبر الوحدات النشطة للشركة المستأجرة.',
    activePlan: 'الباقة النشطة',
    dbLatency: 'استجابة الفهرس',
    kpiApInvoices: 'فواتير الموردين المعالجة',
    kpiAssetsValue: 'إجمالي قيمة سجل الأصول',
    kpiHeadcount: 'الكوادر والموظفين النشطين',
    kpiWorkflowSla: 'معدل الالتزام بـ SLA',
    acrossActiveGl: 'سجلات ضمن دليل الحسابات',
    registeredJsonb: 'أصول مسجلة في JSONB',
    retentionRate: 'معدل استبقاء الكفاءات سنوياً',
    pendingGates: 'بوابات اعتماد معلقة',
    moduleInactive: 'الوحدة غير مفعّلة في الباقة',
    moduleMatrixTitle: 'مصفوفة حالة الوحدات المشترك بها (Freemium / A La Carte)',
    recentRecordsTitle: 'أحدث سجلات الكيانات المخزنة في PostgreSQL JSONB',
    recentRecordsSub: 'فهرسة GIN تتيح استعلامات فرعية سريعة جداً',

    // Tenant Manager
    tenantManagerTitle: 'مدير المستأجرين والاشتراكات المجزأة (A La Carte)',
    tenantManagerSub: 'التحكم الفوري في بوابات الميزات (Feature Toggles)، حصص التخزين، وعزل البيانات عبر RLS',
    currentEnterpriseTenant: 'المستأجر الحالي:',
    subTier: 'مستوى الاشتراك',
    tenantUuid: 'معرف المستأجر (UUID):',
    storageQuota: 'حصة التخزين السحابي',
    storageConsumed: 'مستهلكة لتخزين المستندات وفهارس JSONB.',
    seatUtil: 'تراخيص المقاعد والمستخدمين',
    seatProvisioned: 'مقاعد مخصصة عبر الأقسام المؤسسية.',
    moduleTogglesTitle: 'مصفوفة مفاتيح الوحدات وخيارات الاشتراك المخصصة',
    moduleTogglesSub: 'تبديل الوحدات ديناميكياً؛ يعترض وسيط Express مسارات API فوراً بناءً على استحقاقات الباقة.',
    testRouteBtn: 'اختبار وصول المسار',
    middlewareAuthResult: 'نتيجة فحص وسيط المصادقة (Middleware):',

    // Workflows
    workflowTitle: 'مسارات سير العمل والاعتمادات متعددة المراحل',
    workflowSub: 'تفويض المهام حسب الهيكل التنظيمي، تتبع اتفاقيات مستوى الخدمة (SLA)، وسجلات التدقيق',
    createTaskBtn: 'إنشاء مهمة / طلب اعتماد جديد',
    activeWorkflowsTitle: 'مسارات الاعتماد المؤسسية النشطة',
    linkedDynamicEntities: '(مرتبطة بسجلات الكيانات الديناميكية)',
    slaHours: 'المدة:',
    roleRequired: 'الدور المطلوب:',
    deptTasksQueue: 'قائمة مهام الأقسام وطلبات الاعتماد',
    deptTasksQueueSub: 'مهام حية مفلترة حسب الهيكل الإداري للمستأجر مع اعتماد بضغطة زر',
    allDepts: 'جميع الأقسام',
    allStatuses: 'جميع الحالات',
    approveBtn: 'اعتماد',
    rejectBtn: 'رفض',
    markCompleteBtn: 'اكتمال المهمة',
    signedOffStatus: 'معتمد رسمياً',
    declinedStatus: 'تم الرفض',
    modalCreateTitle: 'إنشاء مهمة في مسار العمل',
    taskTitleInput: 'عنوان المهمة',
    priorityLevel: 'مستوى الأولوية',
    dueDateLabel: 'تاريخ الاستحقاق',
    saveTaskBtn: 'حفظ المهمة',
    priorities: {
      urgent: 'حرجة وعاجلة',
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
    },
    statuses: {
      pending: 'قيد الانتظار',
      in_progress: 'قيد التنفيذ',
      approved: 'معتمد',
      completed: 'مكتمل',
      rejected: 'مرفوض',
    },

    // Modules
    modules: {
      finance: 'المالية والخزينة',
      hr: 'الموارد البشرية والمواهب',
      operations: 'العمليات وسلاسل الإمداد',
      tasks: 'سير العمل والمهام',
      analytics: 'التحليلات التنفيذية',
    },

    // SQL
    sqlTitle: 'بنية وهندسة PostgreSQL المؤسسية',
    sqlSub: 'نصوص DDL كاملة للإنتاج مع فهرسة JSONB، سياسات أمان RLS، ومقارنة مع أنماط EAV',
    tabCore: '1. الجداول الأساسية والاشتراكات',
    tabDynamicForms: '2. النماذج الديناميكية (JSONB)',
    tabWorkflows: '3. سير العمل والمهام',
    tabRls: '4. أمان الصفوف (RLS)',
    tabEav: '5. مقارنة معمارية: JSONB مقابل EAV',
    copySqlBtn: 'نسخ كود SQL',
    copiedSqlBtn: 'تم نسخ SQL!',
    eavTitle: 'الأساس المعماري: لماذا اخترنا PostgreSQL JSONB بدلاً من EAV؟',
    eavIntro: 'في أنظمة SaaS ERP الحديثة، يحتاج المستأجر إلى حقول مخصصة بدون تعديل جداول SQL أو حدوث قفل بالجداول. مقارنة بين النموذجين:',

    // Backend
    backendTitle: 'منطق الواجهة الخلفية ومحرك Express API',
    backendSub: 'وسطاء مصادقة المستأجر وعزل البيانات، فحص اشتراك الوحدات، ووحدات التحكم الديناميكية في JSONB',
    tabMiddlewareCode: '1. وسيط المصادقة وفحص الوحدات',
    tabControllerCode: '2. وحدة تحكم JSONB الديناميكية',
    sandboxTitle: 'بيئة تجربة Express API الحية',
    targetTenant: 'المستأجر المستهدف',
    requiredModuleGuard: 'حارس الوحدة المطلوبة',
    payloadLabel: 'حمولة بيانات JSONB الديناميكية (POST Body):',
    dispatchBtn: 'إرسال الطلب واختبار وسيط Express',
    executingBtn: 'جارٍ تنفيذ سلسلة الوسطاء...',
    terminalLogs: 'سجل استجابة الخادم (Node.js Express Log)',
  },

  en: {
    appName: 'عزوتي - EZWATY ERP',
    appSub: 'Hybrid Cloud & Local On-Premise System • Dynamic JSONB Engine',
    activeTenant: 'Active Tenant:',
    rlsActive: 'RLS Active',
    langToggle: 'العربية',

    // Tabs
    navForms: 'Dynamic Form Studio',
    navDashboard: 'Executive Dashboard',
    navTenants: 'Tenant & Modules (A La Carte)',
    navWorkflows: 'Workflows & Tasks',
    navSql: 'PostgreSQL Architecture',
    navBackend: 'Backend & Express API',
    navHybrid: 'Hybrid & Docker',
    pendingBadge: 'Pending',
    formsBadge: 'Forms',

    // Hybrid Deployment & Docker
    hybridTitle: 'Hybrid Deployment & Docker Infrastructure',
    hybridSub: 'Toggle between Cloud Multi-Tenant SaaS and Single-Tenant On-Premise Local Server using the exact same codebase',
    deploymentModeLabel: 'Active Deployment Mode (DEPLOYMENT_MODE):',
    modeCloud: 'Cloud Multi-Tenant SaaS',
    modeOnPremise: 'On-Premise Single-Tenant Server',
    modeCloudDesc: 'Strict data isolation via tenant_id, PostgreSQL Row-Level Security (RLS), and a la carte quotas.',
    modeOnPremiseDesc: 'High-throughput local execution, tenant checks bypassed, queries defaulted to local singleton tenant, cryptographic license enforced.',
    licenseCardTitle: 'On-Premise Enterprise License Status',
    licenseValid: 'License Active & Cryptographically Verified',
    licenseExpired: 'License Expired or Invalid Signature',
    licenseCompany: 'Licensed Organization:',
    licenseExpiryDate: 'Subscription Expiry Date:',
    licenseKeyInput: 'Cryptographic License Key (Offline/Online):',
    validateLicenseBtn: 'Verify License Key',
    dockerTabCompose: 'docker-compose.yml',
    dockerTabDockerfile: 'Dockerfile',
    dockerTabMiddleware: 'Hybrid Express Middleware',
    dockerTabHrSap: 'HR & SAP Database Adaptability',
    onPremiseActiveBanner: 'Operating in Single-Tenant On-Premise mode. Multi-tenant checks are bypassed and all data maps to the local enterprise server.',
    onPremiseSwitchNotice: 'Cloud tier upgrade buttons and cross-tenant switchers are suppressed for on-premise compliance.',
    copyDockerBtn: 'Copy Docker Config',
    copiedDockerBtn: 'Copied Docker Config!',
    singleTenantLocalNotice: 'Single Local Server Tenant (ID: 00000000-0000-0000-0000-000000000001)',

    // Client Preview Mode (Easter Egg)
    previewModeBanner: 'Preview Mode Active - Read Only',
    previewModeActive: 'Client / Employee Experience Preview',
    previewModeDesc: 'All admin configuration panels, JSONB schema builders, and save buttons are hidden. Form fields are read-only with zero mutation risk.',
    previewModeExitBtn: 'Exit Preview Mode',
    previewModeReadOnlyHint: 'This field is locked in read-only client preview mode',
    secretClickHint: 'Secret Easter Egg: Click application logo 5 times within 2 seconds to toggle Client Preview Mode',

    // Footer
    footerTitle: 'EZWATY ERP - Enterprise System (عزوتي)',
    footerSharedDb: 'Shared Database with Row-Level Security (RLS)',
    footerJsonb: 'Fast indexing with PostgreSQL JSONB GIN',
    footerLatency: 'Database Latency: 1.8ms',

    // Dynamic Form Studio / Builder
    formStudioTitle: 'Dynamic Schema & Form Studio',
    formStudioSub: 'Customize layouts and dynamic fields per tenant without SQL DDL alterations or downtime',
    newTemplateBtn: 'New Template',
    saveVersionBtn: 'Save Version',
    savedSuccess: 'Saved to Database!',
    tabVisualBuilder: 'Visual Form Builder',
    tabLiveRenderer: 'Live Form Renderer & Test Submit',
    tabJsonbSchema: 'PostgreSQL JSONB Schema Definition',
    templateConfig: 'Template Configuration',
    formTitleLabel: 'Form Title',
    entityTypeLabel: 'Entity Type (Table Discriminator)',
    moduleAssocLabel: 'Module Association',
    descLabel: 'Description',
    addDynamicField: 'Add Dynamic Field',
    addDynamicFieldDesc: 'Click any control type to append it to the tenant dynamic form layout:',
    fieldCount: 'Arranged Fields: Changes automatically reflect in JSONB storage',
    removeField: 'Remove field',
    fieldLabel: 'Field Label',
    jsonbKey: 'JSONB Key Identifier',
    placeholderText: 'Placeholder Text',
    requiredCheck: 'Required',
    fullWidthCheck: 'Full Width (2 Col)',
    dropdownOptions: 'Dropdown Select Options (JSON):',
    fieldTypes: {
      text: 'Text Field',
      number: 'Number',
      currency: 'Currency ($)',
      date: 'Date Picker',
      select: 'Dropdown List',
      boolean: 'Boolean Switch',
      textarea: 'Text Area',
    },

    // Form Renderer
    moduleLabel: 'Module:',
    entityLabel: 'Entity:',
    tenantLabel: 'Tenant:',
    selectOptionDefault: '-- Select an option --',
    yesEnabled: 'Yes / Enabled',
    noDisabled: 'No / Disabled',
    resetForm: 'Reset Form',
    cancelBtn: 'Cancel',
    submitEntryBtn: 'Submit Entry to Database',
    persistingBtn: 'Persisting to JSONB...',
    submissionSuccess: "Entity successfully stored in PostgreSQL JSONB under table 'entity_records'",
    validationErrorAlert: 'Please review and resolve the validation errors marked below.',
    jsonbInspectorTitle: 'PostgreSQL JSONB Dynamic In-Memory Column:',
    ginIndexed: 'GIN Indexed',
    requiredFieldError: 'is required.',
    numericError: 'must be a valid number.',
    minimumValueError: 'Minimum value is',

    // Executive Dashboard
    execTitle: 'Executive Cross-Module Analytics',
    execSub: 'Live aggregated metrics querying dynamic JSONB entity tables and transactional workflow engines across subscribed modules.',
    activePlan: 'Active Plan',
    dbLatency: 'Database Latency',
    kpiApInvoices: 'AP Invoices Processed',
    kpiAssetsValue: 'Asset Register Value',
    kpiHeadcount: 'Headcount & Capacity',
    kpiWorkflowSla: 'Workflow SLA Rate',
    acrossActiveGl: 'records across active GL',
    registeredJsonb: 'assets registered in JSONB',
    retentionRate: 'retention rate YTD',
    pendingGates: 'pending approval gates',
    moduleInactive: 'Module Inactive on Plan',
    moduleMatrixTitle: 'Subscribed Module Status Matrix (Freemium / A La Carte)',
    recentRecordsTitle: 'Recent Dynamic Entity Records (JSONB)',
    recentRecordsSub: 'GIN indexing enables sub-millisecond containment lookups',

    // Tenant Manager
    tenantManagerTitle: 'Multi-Tenant & Modular Subscription Manager',
    tenantManagerSub: 'A la Carte Module Feature Toggles, Storage Quotas, and Row-Level Security Isolation',
    currentEnterpriseTenant: 'Current Enterprise Tenant:',
    subTier: 'Subscription Tier',
    tenantUuid: 'Tenant UUID:',
    storageQuota: 'Storage Quota',
    storageConsumed: 'consumed. Document storage & JSONB indexes.',
    seatUtil: 'Seat Utilization',
    seatProvisioned: 'seats provisioned across corporate departments.',
    moduleTogglesTitle: 'A La Carte Feature Toggles & Subscription Modules',
    moduleTogglesSub: 'Toggle modules dynamically. The backend middleware immediately intercepts route requests based on these entitlements.',
    testRouteBtn: 'Test Route Access',
    middlewareAuthResult: 'Middleware Auth Verification:',

    // Workflows
    workflowTitle: 'Workflow Pipeline & Multi-Step Approvals',
    workflowSub: 'Organizational hierarchy task delegation, SLA tracking, and multi-signature authorization',
    createTaskBtn: 'Create Task / Approval Request',
    activeWorkflowsTitle: 'Active Enterprise Approval Workflows',
    linkedDynamicEntities: '(Linked to Dynamic Entity Records)',
    slaHours: 'SLA:',
    roleRequired: 'Role:',
    deptTasksQueue: 'Departmental Tasks & Approval Queue',
    deptTasksQueueSub: 'Live tasks filtered by tenant hierarchy with single-click sign-off',
    allDepts: 'All Departments',
    allStatuses: 'All Statuses',
    approveBtn: 'Approve',
    rejectBtn: 'Reject',
    markCompleteBtn: 'Mark Complete',
    signedOffStatus: 'Signed Off',
    declinedStatus: 'Declined',
    modalCreateTitle: 'Create Workflow Task',
    taskTitleInput: 'Task Title',
    priorityLevel: 'Priority Level',
    dueDateLabel: 'Due Date',
    saveTaskBtn: 'Save Task',
    priorities: {
      urgent: 'Urgent Critical',
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
    },
    statuses: {
      pending: 'Pending',
      in_progress: 'In Progress',
      approved: 'Approved',
      completed: 'Completed',
      rejected: 'Rejected',
    },

    // Modules
    modules: {
      finance: 'Finance & Treasury',
      hr: 'Human Resources & Talent',
      operations: 'Supply Chain & Operations',
      tasks: 'Workflow & Task Engine',
      analytics: 'Executive Analytics & BI',
    },

    // SQL
    sqlTitle: 'PostgreSQL Enterprise Schema & Architecture',
    sqlSub: 'Production DDL scripts with JSONB dynamic indexing, RLS security policies, and performance tuning',
    tabCore: '1. Core & Subscriptions',
    tabDynamicForms: '2. Dynamic Forms (JSONB)',
    tabWorkflows: '3. Workflows & Tasks',
    tabRls: '4. Row-Level Security (RLS)',
    tabEav: '5. Architecture: JSONB vs EAV',
    copySqlBtn: 'Copy SQL Script',
    copiedSqlBtn: 'Copied SQL!',
    eavTitle: 'Architectural Rationale: PostgreSQL JSONB vs EAV Anti-Pattern',
    eavIntro: 'In multi-tenant SaaS ERP systems, tenants require custom fields without running schema altering DDL (ALTER TABLE), which causes table locks. Below is our comparative assessment:',

    // Backend
    backendTitle: 'Phase 2: Backend Logic & Express API Engine',
    backendSub: 'Multi-tenant authentication middleware, subscription module guards, and dynamic JSONB controller logic',
    tabMiddlewareCode: '1. Auth & Module Middleware',
    tabControllerCode: '2. Dynamic JSONB Controller',
    sandboxTitle: 'Live API & Middleware Sandbox',
    targetTenant: 'Target Tenant ID',
    requiredModuleGuard: 'Required Module Guard',
    payloadLabel: 'JSONB Dynamic Data Payload (POST Body):',
    dispatchBtn: 'Dispatch Request & Test Middleware',
    executingBtn: 'Executing Middleware Pipeline...',
    terminalLogs: 'Terminal Response Stream (Node.js Express Log)',
  },
};
