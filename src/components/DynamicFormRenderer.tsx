import React, { useState, useEffect } from 'react';
import {
  DynamicFormField,
  FormTemplate,
  EntityRecord,
} from '../types/erp';
import {
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  HelpCircle,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface DynamicFormRendererProps {
  template: FormTemplate;
  initialData?: Record<string, any>;
  tenantId: string;
  currentUserId?: string;
  currentUserName?: string;
  onSubmitSuccess?: (record: EntityRecord) => void;
  onCancel?: () => void;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  template,
  initialData = {},
  tenantId,
  currentUserId = 'u-current',
  currentUserName = 'System User',
  onSubmitSuccess,
  onCancel,
}) => {
  const { t, isRtl } = useLanguage();

  // 1. Dynamic state for JSONB form data
  const [formData, setFormData] = useState<Record<string, any>>({});
  // 2. Validation error state mapped by field name
  const [errors, setErrors] = useState<Record<string, string>>({});
  // 3. Dynamic options loaded from external/API sources
  const [asyncOptions, setAsyncOptions] = useState<Record<string, { label: string; value: string }[]>>({});
  // 4. Submission & feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize form default values when template changes
  useEffect(() => {
    const initialized: Record<string, any> = { ...initialData };
    template.fields.forEach((field) => {
      if (initialized[field.name] === undefined) {
        if (field.defaultValue !== undefined) {
          initialized[field.name] = field.defaultValue;
        } else if (field.type === 'boolean') {
          initialized[field.name] = false;
        } else if (field.type === 'currency' || field.type === 'number') {
          initialized[field.name] = '';
        } else {
          initialized[field.name] = '';
        }
      }

      // If field specifies a dynamic data source, fetch or simulate fetch
      if (field.dynamicDataSource && !asyncOptions[field.name]) {
        setTimeout(() => {
          setAsyncOptions((prev) => ({
            ...prev,
            [field.name]: [
              { label: isRtl ? 'خيار ديناميكي أ (API)' : 'Dynamic Option Alpha (API)', value: 'alpha' },
              { label: isRtl ? 'خيار ديناميكي ب (API)' : 'Dynamic Option Beta (API)', value: 'beta' },
            ],
          }));
        }, 150);
      }
    });

    setFormData(initialized);
    setErrors({});
    setSubmitFeedback(null);
  }, [template, initialData, isRtl]);

  // Handle field change
  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Validate entire dynamic form against template constraints
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    template.fields.forEach((field) => {
      const val = formData[field.name];

      // 1. Required Check
      if (field.required) {
        if (val === undefined || val === null || val === '') {
          newErrors[field.name] = `${field.label} ${t.requiredFieldError}`;
          return;
        }
      }

      // 2. Numeric / Currency constraints
      if ((field.type === 'number' || field.type === 'currency') && val !== '' && val !== undefined) {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          newErrors[field.name] = `${field.label} ${t.numericError}`;
          return;
        }
        if (field.validation?.min !== undefined && numVal < field.validation.min) {
          newErrors[field.name] = field.validation.errorMessage || `${t.minimumValueError} ${field.validation.min}.`;
          return;
        }
        if (field.validation?.max !== undefined && numVal > field.validation.max) {
          newErrors[field.name] = field.validation.errorMessage || `Max: ${field.validation.max}.`;
          return;
        }
      }

      // 3. Regex Pattern validation
      if (field.validation?.pattern && typeof val === 'string' && val.length > 0) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(val)) {
          newErrors[field.name] = field.validation.errorMessage || `${field.label} format is invalid.`;
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler: Saves to PostgreSQL JSONB format
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setSubmitFeedback({
        type: 'error',
        message: t.validationErrorAlert,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const sanitizedData: Record<string, any> = {};
      template.fields.forEach((field) => {
        const val = formData[field.name];
        if (field.type === 'number' || field.type === 'currency') {
          sanitizedData[field.name] = val === '' ? null : Number(val);
        } else if (field.type === 'boolean') {
          sanitizedData[field.name] = Boolean(val);
        } else {
          sanitizedData[field.name] = val;
        }
      });

      const newRecord: EntityRecord = {
        id: `rec-${Date.now().toString(36)}`,
        tenantId,
        templateId: template.id,
        entityType: template.entityType,
        data: sanitizedData,
        status: 'pending_approval',
        createdBy: currentUserId,
        createdByName: currentUserName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await new Promise((resolve) => setTimeout(resolve, 400));

      setSubmitFeedback({
        type: 'success',
        message: `${t.submissionSuccess} (ID: ${newRecord.id})`,
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(newRecord);
      }
    } catch (err: any) {
      setSubmitFeedback({
        type: 'error',
        message: err.message || 'Failed to submit dynamic form.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render individual dynamic field based on field.type
  const renderField = (field: DynamicFormField) => {
    const value = formData[field.name] ?? '';
    const error = errors[field.name];
    const isColSpan2 = field.colSpan === 2;

    const wrapperClass = `flex flex-col gap-1.5 ${isColSpan2 ? 'md:col-span-2' : 'col-span-1'}`;

    return (
      <div key={field.id} className={wrapperClass}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            {field.label}
            {field.required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {field.tooltip && (
            <div className="group relative flex items-center cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg z-20 pointer-events-none">
                {field.tooltip}
              </div>
            </div>
          )}
        </div>

        {/* Input Control Switcher */}
        {(() => {
          switch (field.type) {
            case 'text':
              return (
                <input
                  type="text"
                  value={value}
                  placeholder={field.placeholder || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-rose-300 focus:ring-rose-500/20 border-rose-500'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
              );

            case 'number':
              return (
                <input
                  type="number"
                  value={value}
                  placeholder={field.placeholder || '0'}
                  min={field.validation?.min}
                  max={field.validation?.max}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-rose-300 focus:ring-rose-500/20 border-rose-500'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
              );

            case 'currency':
              return (
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-slate-400`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={value}
                    placeholder={field.placeholder || '0.00'}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={`w-full ${isRtl ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'} py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                      error
                        ? 'border-rose-300 focus:ring-rose-500/20 border-rose-500'
                        : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
              );

            case 'date':
              return (
                <div className="relative">
                  <input
                    type="date"
                    value={value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                      error
                        ? 'border-rose-300 focus:ring-rose-500/20 border-rose-500'
                        : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
              );

            case 'select': {
              const options = field.options || asyncOptions[field.name] || [];
              return (
                <select
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 cursor-pointer ${
                    error
                      ? 'border-rose-300 focus:ring-rose-500/20 border-rose-500'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                >
                  <option value="">{t.selectOptionDefault}</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              );
            }

            case 'boolean':
              return (
                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">
                    {Boolean(value) ? t.yesEnabled : t.noDisabled}
                  </span>
                </label>
              );

            case 'textarea':
              return (
                <textarea
                  rows={3}
                  value={value}
                  placeholder={field.placeholder || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-rose-300 focus:ring-rose-500/20 border-rose-500'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
              );

            default:
              return (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-lg text-sm"
                />
              );
          }
        })()}

        {error && (
          <p className="text-xs text-rose-600 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Template Header */}
      <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                {t.moduleLabel} {template.module}
              </span>
              <span className="text-xs text-slate-500">
                v{template.version}.0 &bull; {t.entityLabel} <code className="text-slate-700 font-mono">{template.entityType}</code>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{template.name}</h2>
            <p className="text-sm text-slate-600 mt-1">{template.description}</p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {t.tenantLabel} <span className="font-semibold text-slate-700">{tenantId}</span>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6">
        {submitFeedback && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm ${
              submitFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {submitFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{submitFeedback.message}</p>
              {submitFeedback.type === 'success' && (
                <p className="text-xs text-emerald-700 mt-1">
                  PostgreSQL JSONB: <code className="font-mono bg-emerald-100/60 px-1 py-0.5 rounded">data @&gt; '{`{"tenant_id": "${tenantId}"}`}'</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {template.fields.map(renderField)}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const reset: Record<string, any> = {};
              template.fields.forEach((f) => (reset[f.name] = f.defaultValue ?? ''));
              setFormData(reset);
              setErrors({});
              setSubmitFeedback(null);
            }}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            {t.resetForm}
          </button>

          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                {t.cancelBtn}
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? t.persistingBtn : t.submitEntryBtn}
            </button>
          </div>
        </div>
      </form>

      {/* Real-time JSONB Payload Inspector */}
      <div className="px-6 py-4 bg-slate-900 text-slate-200 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.jsonbInspectorTitle} <code className="text-indigo-300">entity_records.data</code></span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{t.ginIndexed}</span>
        </div>
        <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400 max-h-48 border border-slate-800 dir-ltr text-left">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
};
