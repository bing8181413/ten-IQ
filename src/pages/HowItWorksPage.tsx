import { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, LineChart, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

const steps = [
  {
    icon: BookOpen,
    title: '选择一个问题',
    copy: '浏览体育、政治、加密、科技等主题，打开结算规则清晰的市场。',
  },
  {
    icon: LineChart,
    title: '读取市场概率',
    copy: '价格以 1% 到 99% 表示参与者对结果发生概率的综合判断。',
  },
  {
    icon: CheckCircle2,
    title: '选择结果并预览',
    copy: '选择你判断的结果、输入演示金额并查看可能数量，不会产生真实订单。',
  },
  {
    icon: ShieldCheck,
    title: '等待可信来源结算',
    copy: '每个市场都预先说明结算条件与来源，演示版不会触发资金交割。',
  },
];

const questions = [
  [
    '概率为什么会变化？',
    '当参与者获取新信息并调整观点时，买卖意向会改变市场价格，因此概率会随之变化。',
  ],
  [
    'ten-IQ 是否会替用户下注？',
    '不会。当前产品只展示确定性模拟数据和订单预览，不连接真实钱包或资金。',
  ],
  [
    '市场如何结算？',
    '详情页的规则标签会列出判断条件和来源。真实产品还需要独立审核、争议处理和审计流程。',
  ],
  [
    '组合与单个市场有什么区别？',
    '组合要求每一项结果都成立，联合概率更低、风险更高；演示页会实时计算联合概率。',
  ],
] as const;

export function HowItWorksPage() {
  const [open, setOpen] = useState(0);
  return (
    <div className="pm-shell py-8 pb-24 md:pb-10">
      <div className="max-w-3xl">
        <span className="text-sm font-semibold text-brand">玩法介绍</span>
        <h1 className="mt-2 text-3xl font-bold text-foreground">预测市场如何工作</h1>
        <p className="mt-3 text-base leading-7 text-muted">
          价格不是专家结论，而是市场参与者当前观点的聚合。ten-IQ
          用清晰规则和概率变化帮助用户理解正在发生的事。
        </p>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.title} className="p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex size-9 items-center justify-center rounded-control bg-brand-soft text-brand">
                <step.icon aria-hidden="true" size={18} />
              </span>
              <span className="text-xs font-bold text-subtle">0{index + 1}</span>
            </div>
            <h2 className="mt-4 text-base font-bold text-foreground">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{step.copy}</p>
          </Card>
        ))}
      </div>
      <section className="mt-10 max-w-3xl" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl font-bold text-foreground">
          常见问题
        </h2>
        <div className="mt-3 divide-y divide-border border-y border-border">
          {questions.map(([question, answer], index) => (
            <div key={question}>
              <button
                type="button"
                aria-expanded={open === index}
                onClick={() => setOpen(open === index ? -1 : index)}
                className="flex min-h-14 w-full items-center justify-between gap-4 text-left text-sm font-semibold text-foreground"
              >
                {question}
                <ChevronDown
                  aria-hidden="true"
                  size={17}
                  className={cn(
                    'shrink-0 text-muted transition-transform',
                    open === index && 'rotate-180',
                  )}
                />
              </button>
              {open === index ? (
                <p className="pb-4 text-sm leading-6 text-muted">{answer}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
