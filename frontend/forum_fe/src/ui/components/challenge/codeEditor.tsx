import { useEffect, useState } from "react";
import { ChevronDown, Play, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Language } from "./mockData";
import { cn } from "@/lib/utils";
import { useGetLanguages } from "@/api/hooks/languageHook";

interface CodeEditorProps {
  onRun: () => void;
  onSubmit: () => void;
}

export function CodeEditor({ onRun, onSubmit }: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [code, setCode] = useState("");

  const handleLanguageChange = (newLanguage: Language) => {
    setSelectedLanguage(newLanguage);
  };
  const getLanguages = useGetLanguages();

  useEffect(
    function () {
      if (getLanguages.isSuccess) {
        console.log("OK", getLanguages.data);
        setLanguages(getLanguages.data);
        setSelectedLanguage(getLanguages.data[0]);
      }
    },
    [getLanguages.data, getLanguages.isError, getLanguages.isSuccess]
  );

  const lines = code.split("\n");

  return (
    <div className="h-full flex flex-col bg-white/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-black hover:bg-black hover:text-white"
            >
              {selectedLanguage?.name}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-black p-0 border-none"
          >
            {languages?.map((lang) => (
              <DropdownMenuItem
                key={lang.id}
                onClick={() => handleLanguageChange(lang)}
                className={cn(
                  "cursor-pointer",
                  "text-white",
                  "focus:bg-proPurple"
                )}
              >
                {lang.name}
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
