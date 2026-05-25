import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical, CheckCircle2, Circle } from "lucide-react";

type QuestionType = "multiple-choice" | "true-false" | "short-answer" | "fill-in-the-blank";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctIndex?: number;
  correctAnswer?: string;
}

interface QuestionCardProps {
  key?: string | number;
  question: Question;
  onDelete: (id: string) => void;
  onUpdate: (updates: Partial<Question>) => void;
  index: number;
}

export function QuestionCard({ question, onDelete, onUpdate, index }: QuestionCardProps) {
  const handleOptionChange = (optIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optIndex] = value;
    onUpdate({ options: newOptions });
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md border-slate-200 bg-white">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 group-hover:bg-primary transition-colors" />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-slate-300 cursor-grab active:cursor-grabbing" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Question {index + 1}</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{question.type.replace("-", " ")}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-destructive transition-colors h-8 w-8"
          onClick={() => onDelete(question.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500">Question Text</Label>
          <Input 
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Enter your question here..."
            className="rounded-xl border-slate-200 font-medium"
          />
        </div>

        {question.type === "multiple-choice" && (
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-500">Options (Select the correct one)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 shrink-0 rounded-full ${question.correctIndex === idx ? "text-green-500 bg-green-50" : "text-slate-300"}`}
                    onClick={() => onUpdate({ correctIndex: idx })}
                  >
                    {question.correctIndex === idx ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </Button>
                  <Input 
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className={`rounded-xl h-10 border-slate-200 ${question.correctIndex === idx ? "border-green-200 bg-green-50/30" : ""}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === "true-false" && (
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-500">Select Correct Answer</Label>
            <div className="flex gap-4">
              {["True", "False"].map((option, idx) => (
                <Button
                  key={idx}
                  variant={question.correctIndex === idx ? "default" : "outline"}
                  className={`flex-1 rounded-xl h-12 font-bold ${question.correctIndex === idx ? "bg-green-500 hover:bg-green-600" : "border-slate-200"}`}
                  onClick={() => onUpdate({ correctIndex: idx })}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {question.type === "short-answer" && (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500">Correct Answer (Keywords or full answer)</Label>
            <Input 
              value={question.correctAnswer}
              onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
              placeholder="Enter the expected correct answer..."
              className="rounded-xl border-slate-200 font-medium"
            />
          </div>
        )}

        {question.type === "fill-in-the-blank" && (
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-500">Correct Answer for the Blank Space</Label>
            <Input 
              value={question.correctAnswer}
              onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
              placeholder="Enter the exact missing word or term..."
              className="rounded-xl border-slate-200 font-medium"
            />
            <p className="text-[10px] text-slate-400 leading-normal italic">
              * Put "______" or "_____" in the Question Text field above so that students can visually identify where the blank space belongs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
