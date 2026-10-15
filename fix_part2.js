
const fs = require("fs");

function replaceInFileRegex(filePath, searchRegex, replacement) {
  if (!fs.existsSync(filePath)) return console.log("Missing", filePath);
  let content = fs.readFileSync(filePath, "utf8");
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated", filePath);
}

function replaceInFile(filePath, search, replacement) {
  if (!fs.existsSync(filePath)) return console.log("Missing", filePath);
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes(search)) {
    content = content.replace(search, replacement);
    fs.writeFileSync(filePath, content, "utf8");
    console.log("Updated", filePath);
  } else {
    console.log("Not found in", filePath);
  }
}

// EventCluster
replaceInFile("src/components/planner/EventCluster.tsx", 
  "className=\"absolute z-[100] top-0 left-0 w-[220px]", 
  "className=\"absolute z-[100] top-0 left-0 w-[min(220px,80vw)]");

// EventBlock
replaceInFile("src/components/planner/EventBlock.tsx",
  `className={cn(
            "shrink-0 mt-0.5 w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center cursor-pointer transition",
            completed ? "bg-success border-success" : "border-foreground/40 hover:border-foreground"
          )}`,
  `className={cn(
            "relative shrink-0 mt-0.5 w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center cursor-pointer transition",
            "before:content-[\\"\\"] before:absolute before:-inset-2.5 before:md:hidden",
            completed ? "bg-success border-success" : "border-foreground/40 hover:border-foreground"
          )}`
);

// Todos
replaceInFile("src/pages/Todos.tsx", 
  "className=\"opacity-0 group-hover:opacity-100 transition p-1.5 text-muted-foreground hover:text-destructive\"", 
  "className=\"opacity-100 md:opacity-0 md:group-hover:opacity-100 transition p-2 -m-0.5 text-muted-foreground hover:text-destructive\"");
replaceInFileRegex("src/pages/Todos.tsx",
  /className=\{`w-8 h-8 rounded-full/g,
  "className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full");

// Workflows
replaceInFile("src/pages/Workflows.tsx", 
  "className=\"text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity\"", 
  "className=\"text-muted-foreground hover:text-destructive shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity\"");

// Settings
replaceInFileRegex("src/pages/Settings.tsx", 
  /className=\{`w-10 h-10 rounded-xl/g, 
  "className={`w-11 h-11 sm:w-10 sm:h-10 rounded-xl");
replaceInFileRegex("src/pages/Settings.tsx", 
  /className="surface-card p-6"/g, 
  "className=\"surface-card p-4 sm:p-6\"");

// EventDialog
replaceInFileRegex("src/components/planner/EventDialog.tsx", 
  /className=\{`w-8 h-8 rounded-full transition-all hover:scale-110/g, 
  "className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full transition-all hover:scale-110");
replaceInFile("src/components/planner/EventDialog.tsx", 
  "className=\"grid grid-cols-3 gap-3\"", 
  "className=\"grid grid-cols-1 sm:grid-cols-3 gap-3\"");
replaceInFileRegex("src/components/planner/EventDialog.tsx", 
  /className=\{`flex-1 h-9 rounded-md text-xs font-semibold transition/g, 
  "className={`flex-1 h-11 sm:h-9 rounded-md text-xs font-semibold transition");

// Achievements
replaceInFileRegex("src/pages/Achievements.tsx", 
  /className=\{`surface-card p-6 text-center transition-all/g, 
  "className={`surface-card p-4 sm:p-6 text-center transition-all");

// Planner
replaceInFile("src/pages/Planner.tsx", 
  "onClick={() => navigate(-1)} className=\"h-9 w-9\"", 
  "onClick={() => navigate(-1)} className=\"h-11 w-11 md:h-9 md:w-9\"");
replaceInFile("src/pages/Planner.tsx", 
  "onClick={() => navigate(1)} className=\"h-9 w-9\"", 
  "onClick={() => navigate(1)} className=\"h-11 w-11 md:h-9 md:w-9\"");
replaceInFile("src/pages/Planner.tsx", 
  "className=\"px-3 min-w-[200px] text-center font-display text-lg tracking-tight capitalize\"", 
  "className=\"px-3 min-w-[140px] md:min-w-[200px] text-center font-display text-lg tracking-tight capitalize\"");

// Reminders
replaceInFile("src/pages/Reminders.tsx",
  "className=\"surface-card p-4 flex items-center gap-4\"",
  "className=\"surface-card p-4 flex flex-wrap items-center gap-3\""
);
replaceInFile("src/pages/Reminders.tsx",
  "className=\"flex-1 min-w-0\"",
  "className=\"flex-1 min-w-[160px]\""
);
replaceInFile("src/pages/Reminders.tsx",
  "className=\"w-10 h-10 rounded-xl flex items-center justify-center shrink-0\"",
  "className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.active ? \\\"bg-primary/15 text-primary\\\" : \\\"bg-secondary/40 text-muted-foreground\\\"}`"
);

