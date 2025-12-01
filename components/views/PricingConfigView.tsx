import React from 'react';
import { PricingRule, MultiSubjectRule, Subject } from '../../types';
import { SUBJECT_CN } from '../../constants';

interface PricingConfigViewProps {
    pricingRules: PricingRule;
    setPricingRules: React.Dispatch<React.SetStateAction<PricingRule>>;
    addLog: (action: string, details: string) => void;
}

export const PricingConfigView: React.FC<PricingConfigViewProps> = ({ pricingRules, setPricingRules, addLog }) => {
    // Helper to update a rule. If it doesn't exist, we create it.
    const updateMultiSubjectRule = (threshold: number, field: keyof MultiSubjectRule, value: any) => {
        setPricingRules(prev => {
            const rules = [...prev.discounts.multiSubject];
            const index = rules.findIndex(r => r.threshold === threshold);
            if (index >= 0) {
                rules[index] = { ...rules[index], [field]: value };
            } else {
                // Should not happen with current UI hardcoding 2 and 3, but safe fallback
                rules.push({ threshold, type: 'reduction', amount: 0, ...({ [field]: value }) });
            }
            return {
                ...prev,
                discounts: {
                    ...prev.discounts,
                    multiSubject: rules
                }
            };
        });
    };

    const getRule = (threshold: number) => {
        return pricingRules.discounts.multiSubject.find(r => r.threshold === threshold) || { threshold, type: 'reduction', amount: 0 };
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">系统价格配置</h2>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">基础课时费率 (每小时)</h3>
                    <p className="text-sm text-slate-500">如无特殊设置，将应用此默认价格。</p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(pricingRules.basePrice).map(([subj, price]) => (
                        <div key={subj} className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">{SUBJECT_CN[subj as Subject]}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-500 sm:text-sm">¥</span>
                                </div>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setPricingRules(prev => ({
                                            ...prev,
                                            basePrice: { ...prev.basePrice, [subj]: val }
                                        }));
                                        addLog('配置更改', `更新了 ${SUBJECT_CN[subj as Subject]} 的基础价格为 ${val}`);
                                    }}
                                    className="pl-7 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">折扣逻辑引擎</h3>
                </div>
                <div className="p-6 space-y-6">
                    {/* Volume Discount */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex-1">
                            <h4 className="font-medium text-slate-900">课时量折扣 (基础)</h4>
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                                当总课时 {'>'}
                                <input
                                    type="number"
                                    className="w-16 p-1 border rounded text-center"
                                    value={pricingRules.discounts.hoursThreshold}
                                    onChange={(e) => setPricingRules(prev => ({ ...prev, discounts: { ...prev.discounts, hoursThreshold: +e.target.value } }))}
                                />
                                , 应用折扣系数
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-16 p-1 border rounded text-center"
                                    value={pricingRules.discounts.hoursDiscount}
                                    onChange={(e) => setPricingRules(prev => ({ ...prev, discounts: { ...prev.discounts, hoursDiscount: +e.target.value } }))}
                                />
                                <span className="text-slate-400">({((1 - pricingRules.discounts.hoursDiscount) * 100).toFixed(0)}% 优惠)</span>
                            </div>
                        </div>
                    </div>

                    {/* Multi-Subject Tier 1: 2 Subjects */}
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex-1">
                            <h4 className="font-medium text-blue-900">联报折扣 (双科)</h4>
                            <div className="flex items-center gap-2 mt-2 text-sm text-blue-800">
                                同时补 <b>2</b> 科:
                                <select
                                    className="p-1 border border-blue-200 rounded text-sm bg-white"
                                    value={getRule(2).type}
                                    onChange={(e) => updateMultiSubjectRule(2, 'type', e.target.value)}
                                >
                                    <option value="reduction">每科立减</option>
                                    <option value="fixed">每科固定价</option>
                                </select>
                                <input
                                    type="number"
                                    className="w-20 p-1 border border-blue-200 rounded text-center"
                                    value={getRule(2).amount}
                                    onChange={(e) => updateMultiSubjectRule(2, 'amount', +e.target.value)}
                                />
                                元
                            </div>
                            <p className="text-xs text-blue-600 mt-1">例如：每科立减 10 元，或每科固定 50 元。</p>
                        </div>
                    </div>

                    {/* Multi-Subject Tier 2: 3 Subjects */}
                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex-1">
                            <h4 className="font-medium text-purple-900">联报折扣 (三科及以上)</h4>
                            <div className="flex items-center gap-2 mt-2 text-sm text-purple-800">
                                同时补 <b>3</b> 科 (及以上):
                                <select
                                    className="p-1 border border-purple-200 rounded text-sm bg-white"
                                    value={getRule(3).type}
                                    onChange={(e) => updateMultiSubjectRule(3, 'type', e.target.value)}
                                >
                                    <option value="reduction">每科立减</option>
                                    <option value="fixed">每科固定价</option>
                                </select>
                                <input
                                    type="number"
                                    className="w-20 p-1 border border-purple-200 rounded text-center"
                                    value={getRule(3).amount}
                                    onChange={(e) => updateMultiSubjectRule(3, 'amount', +e.target.value)}
                                />
                                元
                            </div>
                            <p className="text-xs text-purple-600 mt-1">优先于双科折扣触发。</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
