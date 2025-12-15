import { useState } from "react";
import { ChevronDown, Play, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Language, languageLabels, defaultCode } from "./mockData";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  onRun: () => void;
  onSubmit: () => void;
}

export function CodeEditor({ onRun, onSubmit }: CodeEditorProps) {
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState(defaultCode[language]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(defaultCode[newLanguage]);
  };

  const lines = code.split("\n");

  return (
    <div className="h-full flex flex-col bg-editor-bg rounded-lg border border-editor-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border bg-card">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {languageLabels[language]}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-popover border-border"
          >
            {(Object.keys(languageLabels) as Language[]).map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={cn(
                  "cursor-pointer",
                  language === lang && "bg-accent"
                )}
              >
                {languageLabels[lang]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="bg-proPurple"
            onClick={onSubmit}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          {/* Line Numbers */}
          <div className="flex-shrink-0 py-4 px-3 text-right select-none bg-background/50">
            {lines.map((_, index) => (
              <div
                key={index}
                className="font-mono text-sm leading-6 text-line-number"
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code Area */}
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={cn(
                "absolute inset-0 w-full h-full p-4 font-mono text-sm leading-6",
                "bg-transparent text-foreground resize-none outline-none",
                "caret-primary"
              )}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
