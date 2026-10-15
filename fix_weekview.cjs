
const fs = require("fs");
let c = fs.readFileSync("src/components/planner/WeekView.tsx", "utf8");

c = c.replace(
  `<div className="surface-card overflow-hidden">
      <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border/40 sticky top-0 bg-card/95 backdrop-blur-md z-20">`,
  `<div className="surface-card overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[56px_repeat(7,minmax(92px,1fr))] border-b border-border/40 sticky top-0 bg-card/95 backdrop-blur-md z-20">`
);

c = c.replace(
  `<div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border/40 bg-secondary/20">`,
  `<div className="grid grid-cols-[56px_repeat(7,minmax(92px,1fr))] border-b border-border/40 bg-secondary/20">`
);

c = c.replace(
  `<div className="overflow-y-auto max-h-[calc(100vh-280px)]">
        <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]" style={{ height: HOUR_PX * 24 }}>
          <div className="relative border-r border-border/40">`,
  `<div className="overflow-y-auto max-h-[calc(100dvh-420px)] md:max-h-[calc(100dvh-280px)]">
        <div className="grid grid-cols-[56px_repeat(7,minmax(92px,1fr))]" style={{ height: HOUR_PX * 24 }}>
          <div className="relative border-r border-border/40 sticky left-0 z-10 bg-card">`
);

c = c.replace(
  `        </div>
      </div>
    </div>
  );
}`,
  `        </div>
      </div>
        </div>
      </div>
    </div>
  );
}`
);

fs.writeFileSync("src/components/planner/WeekView.tsx", c, "utf8");
console.log("WeekView fixed");

