import { CourseRecord, PricingRule, Student, BillingResult, Subject } from '../types';

/**
 * Calculates the billing details for a specific student given a set of records and rules.
 */
export const calculateStudentBill = (
  student: Student,
  records: CourseRecord[],
  rules: PricingRule
): BillingResult => {
  let originalCost = 0;
  let totalHours = 0;
  const subjectCounts: Record<Subject, number> = {
    Chinese: 0,
    Math: 0,
    English: 0,
    Physics: 0,
    Chemistry: 0,
  };

  // 1. Calculate Original Cost (Base + Overrides) & Collect Dates
  const subjectDetails: Record<Subject, string[]> = {
    Chinese: [], Math: [], English: [], Physics: [], Chemistry: []
  };

  records.forEach((record) => {
    totalHours += record.hours;
    const subject = record.subject;

    if (subjectCounts[subject] !== undefined) {
      subjectCounts[subject] += record.hours;
      // Format date: 2023-10-20 (2h)
      subjectDetails[subject].push(`${record.date} (${record.hours}h)`);
    }

    // Determine rate: Override > Base
    const overridePrice = student.priceOverrides?.[subject];
    const basePrice = rules.basePrice[subject];
    const finalRate = overridePrice !== undefined ? overridePrice : basePrice;

    originalCost += finalRate * record.hours;
  });

  // 2. Apply Discounts
  let finalCost = originalCost;
  const appliedDiscounts: string[] = [];

  // Rule A: Multi-Subject Discount (Check tiers)
  // Count unique subjects taken
  const uniqueSubjects = Object.entries(subjectCounts).filter(([_, hours]) => hours > 0).length;

  // Sort rules by threshold descending to find the best match first
  const sortedRules = [...rules.discounts.multiSubject].sort((a, b) => b.threshold - a.threshold);
  const matchedRule = sortedRules.find(r => uniqueSubjects >= r.threshold);

  if (matchedRule) {
    if (matchedRule.type === 'reduction') {
      // Reduce price per hour across all hours
      const discountAmount = totalHours * matchedRule.amount;
      finalCost -= discountAmount;
      appliedDiscounts.push(`多科联报 (>= ${matchedRule.threshold} 科): 每课时立减 ¥${matchedRule.amount}，共减 ¥${discountAmount}`);
    } else if (matchedRule.type === 'fixed') {
      // If fixed price per hour, recalculate total cost
      const fixedTotal = totalHours * matchedRule.amount;
      // Only apply if it's actually cheaper
      if (fixedTotal < finalCost) {
        finalCost = fixedTotal;
        appliedDiscounts.push(`多科联报 (>= ${matchedRule.threshold} 科): 统一定价 ¥${matchedRule.amount}/课时`);
      }
    }
  }

  // Rule B: Volume Discount (Hours > Threshold)
  // Apply this after multi-subject adjustments? Usually yes, volume discount is on top.
  if (totalHours > rules.discounts.hoursThreshold) {
    // const discountAmount = finalCost * (1 - rules.discounts.hoursDiscount);
    finalCost = finalCost * rules.discounts.hoursDiscount;
    appliedDiscounts.push(`课时量折扣 (> ${rules.discounts.hoursThreshold} 课时): -${(100 * (1 - rules.discounts.hoursDiscount)).toFixed(0)}%`);
  }

  return {
    student,
    totalHours,
    subjectCounts,
    originalCost,
    appliedDiscounts,
    finalCost: Math.round(finalCost * 100) / 100, // Round to 2 decimals
    records,
    subjectDetails
  };
};

export const getAggregatedStats = (records: CourseRecord[]) => {
  const totalRevenue = 0; // Calculated dynamically in UI usually
  const subjectDistribution: Record<string, number> = {};
  const teacherLoad: Record<string, number> = {};

  records.forEach(r => {
    subjectDistribution[r.subject] = (subjectDistribution[r.subject] || 0) + r.hours;
    teacherLoad[r.teacherName] = (teacherLoad[r.teacherName] || 0) + r.hours;
  });

  return {
    subjectDistribution: Object.entries(subjectDistribution).map(([name, value]) => ({ name, value })),
    teacherLoad: Object.entries(teacherLoad).map(([name, value]) => ({ name, value })),
  };
}