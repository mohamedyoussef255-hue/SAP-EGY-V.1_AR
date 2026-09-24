import React, { useState } from 'react';
import { DynamicFormField, DynamicFieldType, FormTemplate, ModuleType } from '../types/erp';
import {
  Plus,
  Trash2,
  Settings,
  Layers,
  Code2,
  Eye,
  Check,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  ListFilter,
  FileText,
  DollarSign,
} from 'lucide-react';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { useLanguage } from '../i18n/LanguageContext';

interface FormBuilderProps {
  templates: FormTemplate[];
  activeTenantId: string;
  onSaveTemplate: (updatedTemplate: FormTemplate) => void;
  onCreateNewTemplate: (newTemplate: FormTemplate) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  templates,
  activeTenantId,
  onSaveTemplate,
  onCreateNewTemplate,
}) => {
  const { t, isRtl } = useLanguage();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'schema'>('editor');

  const currentTemplate = templates.find((tmpl) => tmpl.id === selectedTemplateId) || templates[0];

  const [fields, setFields] = useState<DynamicFormField[]>(
    currentTemplate ? [...currentTemplate.fields] : []
  );
  const [templateName, setTemplateName] = useState(currentTemplate?.name || '');
  const [templateDesc, setTemplateDesc] = useState(currentTemplate?.description || '');
  const [entityType, setEntityType] = useState(currentTemplate?.entityType || '');
  const [module, setModule] = useState<ModuleType>(currentTemplate?.module || 'operations');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectTemplate = (id: string) => {
    const tmpl = templates.find((x) => x.id === id);
    if (tmpl) {
      setSelectedTemplateId(tmpl.id);
      setFields([...tmpl.fields]);
      setTemplateName(tmpl.name);
      setTemplateDesc(tmpl.description);
      setEntityType(tmpl.entityType);
      setModule(tmpl.module);
      setSavedSuccess(false);
    }
  };

  const handleUpdateField = (id: string, updates: Partial<DynamicFormField>) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          if (updates.label && f.name.startsWith('field_')) {
            const suggestedKey = updates.label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '');
            return { ...f, ...updates, name: suggestedKey || f.name };
          }
          return { ...f, ...updates };
        }
        return f;
      })
    );
  };

  const handleAddField = (type: DynamicFieldType) => {
    const fieldCount = fields.length + 1;
    const newField: DynamicFormField = {
      id: `f-${Date.now().toString(36)}`,
      name: `custom_${type}_${fieldCount}`,
      label: `${t.fieldTypes[type]} ${fieldCount}`,
      type,
      required: false,
      colSpan: type === 'textarea' ? 2 : 1,
      placeholder: '',
      options:
        type === 'select'
          ? [
              { label: isRtl ? 'الخيار أ' : 'Option A', value: 'opt_a' },
              { label: isRtl ? 'الخيار ب' : 'Option B', value: 'opt_b' },
            ]
          : undefined,
    };
    setFields((prev) => [...prev, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    const updated: FormTemplate = {
      ...currentTemplate,
      tenantId: activeTenantId,
      name: templateName,
      description: templateDesc,
      entityType,
      module,
      version: currentTemplate.version + 1,
      fields,
      updatedAt: new Date().toISOString(),
    };
    onSaveTemplate(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateNewBlank = () => {
    const newTmpl: FormTemplate = {
      id: `tmpl-${Date.now().toString(36)}`,
      tenantId: activeTenantId,
      entityType: 'custom_entity',
      name: isRtl ? 'قالب نموذج مخصص جديد' : 'New Custom Form Template',
      description: isRtl ? 'نموذج إدخال بيانات ديناميكي محدد من المستأجر' : 'Tenant defined dynamic data collection template',
      module: 'operations',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [
        {
          id: 'cf-1',
          name: 'title',
          label: isRtl ? 'العنوان' : 'Title',
          type: 'text',
          required: true,
          colSpan: 2,
        },
      ],
    };
    onCreateNewTemplate(newTmpl);
    setSelectedTemplateId(newTmpl.id);
    setFields(newTmpl.fields);
    setTemplateName(newTmpl.name);
    setTemplateDesc(newTmpl.description);
    setEntityType(newTmpl.entityType);
    setModule(newTmpl.module);
  };

  const getFieldIcon = (type: DynamicFieldType) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4 text-sky-500" />;
      case 'number':
        return <Hash className="w-4 h-4 text-emerald-500" />;
      case 'currency':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'date':
        return <Calendar className="w-4 h-4 text-violet-500" />;
      case 'boolean':
        return <ToggleLeft className="w-4 h-4 text-rose-500" />;
      case 'select':
        return <ListFilter className="w-4 h-4 text-indigo-500" />;
      case 'textarea':
        return <FileText className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Selector & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{t.formStudioTitle}</h1>
            <p className="text-xs text-slate-500">{t.formStudioSub}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTemplateId}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
          >
            {templates.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name} (v{tmpl.version}.0) &bull; [{tmpl.module.toUpperCase()}]
              </option>
            ))}
          </select>

          <button
            onClick={handleCreateNewBlank}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {t.newTemplateBtn}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {savedSuccess ? t.savedSuccess : t.saveVersionBtn}
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('editor')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'editor'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          {t.tabVisualBuilder} ({fields.length})
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          {t.tabLiveRenderer}
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'schema'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          {t.tabJsonbSchema}
        </button>
      </div>

      {/* TAB 1: VISUAL BUILDER */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.templateConfig}
              </h3>
              <div>
                <label className="text-xs font-medium text-slate-700">{t.formTitleLabel}</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">{t.entityTypeLabel}</label>
                <input
                  type="text"
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-slate-50 dir-ltr text-left"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">{t.moduleAssocLabel}</label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value as ModuleType)}
                  className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-slate-50"
                >
                  <option value="operations">{t.modules.operations}</option>
                  <option value="finance">{t.modules.finance}</option>
                  <option value="hr">{t.modules.hr}</option>
                  <option value="tasks">{t.modules.tasks}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">{t.descLabel}</label>
                <textarea
                  rows={2}
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {/* Field Type Palette */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.addDynamicField}
              </h3>
              <p className="text-[11px] text-slate-500">{t.addDynamicFieldDesc}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'text', label: t.fieldTypes.text },
                  { type: 'number', label: t.fieldTypes.number },
                  { type: 'currency', label: t.fieldTypes.currency },
                  { type: 'date', label: t.fieldTypes.date },
                  { type: 'select', label: t.fieldTypes.select },
                  { type: 'boolean', label: t.fieldTypes.boolean },
                  { type: 'textarea', label: t.fieldTypes.textarea },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleAddField(item.type as DynamicFieldType)}
                    className="p-2.5 text-left border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 rounded-lg transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    {getFieldIcon(item.type as DynamicFieldType)}
                    <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-900">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Field List */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-slate-500">
                {t.fieldCount} ({fields.length})
              </div>
            </div>

            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {getFieldIcon(field.type)}
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      {t.fieldTypes[field.type]}
                    </span>
                    <span className="text-xs text-slate-400 font-mono dir-ltr">
                      (JSONB: <code className="text-indigo-600 font-bold">{field.name}</code>)
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveField(field.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title={t.removeField}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">{t.fieldLabel}</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600">{t.jsonbKey}</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md dir-ltr text-left"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600">{t.placeholderText}</label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      {t.requiredCheck}
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={field.colSpan === 2}
                        onChange={(e) =>
                          handleUpdateField(field.id, { colSpan: e.target.checked ? 2 : 1 })
                        }
                        className="rounded text-indigo-600"
                      />
                      {t.fullWidthCheck}
                    </label>
                  </div>
                </div>

                {field.type === 'select' && (
                  <div className="mt-2 pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded-lg">
                    <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                      {t.dropdownOptions}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.options?.map((opt, oIdx) => (
                        <span
                          key={oIdx}
                          className="px-2 py-1 bg-white border border-slate-200 text-xs rounded text-slate-700 font-mono"
                        >
                          {opt.label} ({opt.value})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PREVIEW & TEST */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <DynamicFormRenderer
            template={{
              ...currentTemplate,
              name: templateName,
              description: templateDesc,
              entityType,
              module,
              fields,
            }}
            tenantId={activeTenantId}
            onSubmitSuccess={(record) => {
              console.log('Submitted successfully to JSONB:', record);
            }}
          />
        </div>
      )}

      {/* TAB 3: JSON SCHEMA DEFINITION */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{t.tabJsonbSchema}</h3>
              <p className="text-xs text-slate-400">
                PostgreSQL table <code>form_templates</code> &bull; Tenant <code>{activeTenantId}</code>
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700/50">
              Valid JSONB
            </span>
          </div>

          <pre className="text-xs font-mono bg-slate-950 p-4 rounded-lg overflow-x-auto text-emerald-400 border border-slate-800 max-h-[500px] dir-ltr text-left">
            {JSON.stringify(
              {
                template_id: currentTemplate.id,
                tenant_id: activeTenantId,
                entity_type: entityType,
                version: currentTemplate.version,
                schema_definition: {
                  layout: 'grid_2_col',
                  fields: fields.map((f) => ({
                    name: f.name,
                    label: f.label,
                    type: f.type,
                    required: f.required,
                    placeholder: f.placeholder,
                    col_span: f.colSpan || 1,
                    validation: f.validation,
                    options: f.options,
                  })),
                },
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};
