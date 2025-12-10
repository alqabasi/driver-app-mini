import React from 'react';

interface IncomeExpenseChartProps {
  income: number;
  expense: number;
  height?: number;
  barWidth?: string;
  className?: string;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ 
  income, 
  expense, 
  height = 32,
  barWidth = "w-1.5",
  className = ''
}) => {
  if (income === 0 && expense === 0) {
      return (
          <div className={`flex items-end gap-1 ${className}`} style={{ height: `${height}px` }}>
              <div className={`${barWidth} bg-slate-100 rounded-t-sm h-full`}></div>
              <div className={`${barWidth} bg-slate-100 rounded-t-sm h-full`}></div>
          </div>
      )
  }

  const max = Math.max(income, expense);
  const incomePercent = max > 0 ? (income / max) * 100 : 0;
  const expensePercent = max > 0 ? (expense / max) * 100 : 0;

  return (
    <div 
        className={`flex items-end gap-1 select-none ${className}`} 
        style={{ height: `${height}px` }} 
        dir="ltr"
        title={`وارد: ${income.toLocaleString()} | مصروف: ${expense.toLocaleString()}`}
    >
      {/* Income Bar (Green) */}
      <div className="relative h-full flex items-end group">
        <div 
            className={`${barWidth} bg-emerald-50 rounded-t-sm transition-all duration-500 flex items-end`}
            style={{ height: '100%' }}
        >
             <div 
                className={`w-full bg-emerald-500 rounded-t-sm transition-all duration-700`}
                style={{ height: `${incomePercent}%` }}
             />
        </div>
      </div>
      
      {/* Expense Bar (Red) */}
      <div className="relative h-full flex items-end group">
         <div 
            className={`${barWidth} bg-red-50 rounded-t-sm transition-all duration-500 flex items-end`}
            style={{ height: '100%' }}
         >
             <div 
                className={`w-full bg-red-500 rounded-t-sm transition-all duration-700`}
                style={{ height: `${expensePercent}%` }}
             />
         </div>
      </div>
    </div>
  );
};