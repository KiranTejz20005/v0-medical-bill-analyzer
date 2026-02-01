"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, ArrowRight, FileText, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TextEditorModalProps {
  initialText: string;
  onConfirm: (text: string) => void;
  onClose: () => void;
  isOcrFailed?: boolean;
}

export function TextEditorModal({
  initialText,
  onConfirm,
  onClose,
  isOcrFailed,
}: TextEditorModalProps) {
  const [text, setText] = useState(initialText);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      className={`fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-zinc-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-zinc-800/50 shadow-2xl transition-all duration-300 ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isOcrFailed ? 'bg-amber-500/10' : 'bg-zinc-800'} rounded-xl flex items-center justify-center`}>
              {isOcrFailed ? (
                <Edit3 className="w-5 h-5 text-amber-500" />
              ) : (
                <FileText className="w-5 h-5 text-zinc-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isOcrFailed ? "Manual Text Entry" : "Review Extracted Text"}
              </h2>
              <p className="text-xs text-zinc-500">
                {isOcrFailed 
                  ? "Paste your bill text to continue"
                  : "Edit the extracted text before analysis if needed"
                }
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        {isOcrFailed && (
          <div className="mx-6 mt-5 p-4 bg-amber-950/30 border border-amber-900/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-400 font-medium mb-1">
                Running in fallback mode
              </p>
              <p className="text-xs text-amber-500/70 leading-relaxed">
                AI extraction is temporarily unavailable. Your analysis will continue with our static analysis engine, which provides the same accuracy for detecting billing errors, duplicate charges, and pricing issues. Simply paste or type your bill text below.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-80 bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-5 text-sm font-mono text-zinc-300 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent transition-all placeholder:text-zinc-600"
            placeholder={`// Paste itemized bill text here...
// Example:
99285 EMERGENCY DEPT VISIT ....... $1,420.00
85025 COMPLETE BLOOD COUNT ....... $125.00
70450 CT HEAD/BRAIN .............. $2,840.00`}
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-zinc-800/50 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-600 font-mono">
              {text.length.toLocaleString()} characters
            </span>
            {text.trim() && (
              <span className="text-xs text-green-500/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Ready
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-white hover:bg-zinc-800/50 bg-transparent transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(text)}
              disabled={!text.trim()}
              className="bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continue to Analysis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
