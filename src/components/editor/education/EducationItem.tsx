import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/useResumeStore";
import { Education } from "@/types/resume";
import {
  useDragControls,
  Reorder,
  motion,
  AnimatePresence,
} from "framer-motion";
import { GripVertical, Eye, EyeOff, ChevronDown, Trash2 } from "lucide-react";
import { useState, useCallback } from "react";
import Field from "../Field";
import ThemeModal from "@/components/shared/ThemeModal";
import { useTranslations } from "@/i18n/compat/client";

interface EducationEditorProps {
  education: Education;
  onSave: (education: Education) => void;
  onDelete: () => void;
  onCancel: () => void;
}

/** 211/985/双一流 标签徽章配置 */
const SCHOOL_TAGS: Array<{ value: "211" | "985" | "双一流" }> = [
  { value: "211" },
  { value: "985" },
  { value: "双一流" },
];

/** 预览简历中渲染的徽章组件（只传样式，字号跟随父元素）*/
export const SchoolTagBadge = ({ tag }: { tag: "211" | "985" }) => {
  const isBlue = tag === "211";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "0.7em",
        lineHeight: 1,
        padding: "1px 4px",
        borderRadius: "3px",
        fontWeight: 600,
        verticalAlign: "middle",
        marginLeft: "4px",
        border: `1px solid ${isBlue ? "#93c5fd" : "#fdba74"}`,
        color: isBlue ? "#1d4ed8" : "#c2410c",
        backgroundColor: isBlue ? "#eff6ff" : "#fff7ed",
        letterSpacing: "0.02em",
      }}
    >
      {tag}
    </span>
  );
};

const EducationEditor: React.FC<EducationEditorProps> = ({
  education,
  onSave,
}) => {
  const t = useTranslations("workbench.educationItem");
  const handleChange = (field: keyof Education, value: string) => {
    onSave({
      ...education,
      [field]: value,
    });
  };

  /** 切换 211/985 标签 */
  const handleTagToggle = (tag: "211" | "985" | "双一流") => {
    const currentTags = education.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onSave({ ...education, tags: newTags });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label={t("labels.school")}
            value={education.school}
            onChange={(value) => handleChange("school", value)}
            placeholder={t("placeholders.school")}
          />
          <Field
            label={t("labels.major")}
            value={education.major}
            onChange={(value) => handleChange("major", value)}
            placeholder={t("placeholders.major")}
          />
        </div>

        {/* 211/985 标签选择 */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            {t("labels.tags")}
          </span>
          <div className="flex items-center gap-2">
            {SCHOOL_TAGS.map((tagConfig) => {
              const isActive = (education.tags || []).includes(tagConfig.value);
              return (
                <button
                  key={tagConfig.value}
                  type="button"
                  onClick={() => handleTagToggle(tagConfig.value)}
                  title={t("tags.hint")}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer select-none",
                    isActive
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {tagConfig.value}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label={t("labels.degree")}
            value={education.degree}
            onChange={(value) => handleChange("degree", value)}
            placeholder={t("placeholders.degree")}
          />

          <Field
            label={t("labels.gpa")}
            value={education.gpa || ""}
            onChange={(value) => handleChange("gpa", value)}
            placeholder={t("placeholders.gpa")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label={t("labels.startDate")}
            value={education.startDate}
            onChange={(value) => handleChange("startDate", value)}
            type="date"
            placeholder="YYYY-MM"
          />
          <Field
            label={t("labels.endDate")}
            value={education.endDate}
            onChange={(value) => handleChange("endDate", value)}
            type="date"
            placeholder="YYYY-MM"
            showPresentSwitch={true}
          />
        </div>

        <Field
          label={t("labels.description")}
          value={education.description || ""}
          onChange={(value) => handleChange("description", value)}
          type="editor"
          placeholder={t("placeholders.description")}
        />
      </div>
    </div>
  );
};



const EducationItem = ({ education }: { education: Education }) => {
  const { updateEducation, deleteEducation } = useResumeStore();
  const dragControls = useDragControls();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleVisibilityToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (isUpdating) return;

      setIsUpdating(true);
      setTimeout(() => {
        updateEducation({
          ...education,
          visible: !education.visible,
        });
        setIsUpdating(false);
      }, 10);
    },
    [education, updateEducation, isUpdating]
  );

  return (
    <Reorder.Item
      id={education.id}
      value={education}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        "rounded-lg border overflow-hidden flex group",
        "bg-card hover:border-primary/50",
        "border-border"
      )}
    >
      <div
        onPointerDown={(event) => {
          if (expandedId === education.id) return;
          dragControls.start(event);
        }}
        className={cn(
          "w-12 flex items-center justify-center border-r shrink-0 touch-none",
          "dark:border-neutral-800",
          "border-border",
          expandedId === education.id
            ? "cursor-not-allowed"
            : "cursor-grab hover:bg-muted/50"
        )}
      >
        <GripVertical
          className={cn(
            "w-4 h-4",
            "text-muted-foreground",
            expandedId === education.id && "opacity-50",
            "transform transition-transform group-hover:scale-110"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "px-4 py-4 flex items-center justify-between",
            expandedId === education.id && "bg-muted/10",
            "cursor-pointer select-none"
          )}
          onClick={(e) => {
            if (expandedId === education.id) {
              setExpandedId(null);
            } else {
              setExpandedId(education.id);
            }
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div>
                <h3
                  className={cn(
                    "font-medium truncate",
                    "text-foreground"
                  )}
                >
                  {education.school || "未填写学校"}
                  {/* 在标题旁显示已选的 211/985 徽章 */}
                  {(education.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-1 py-0 rounded text-[10px] font-medium leading-tight border ml-1 align-middle border-border text-muted-foreground bg-transparent"
                    >
                      {tag}
                    </span>
                  ))}
                </h3>
                {(education.major || education.degree) && (
                  <p
                    className={cn(
                      "text-sm truncate",
                      "dark:text-neutral-400",
                      "text-gray-500"
                    )}
                  >
                    {[education.major, education.degree]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              disabled={isUpdating}
              className={cn("text-sm")}
              onClick={handleVisibilityToggle}
            >
              {education.visible ? (
                <Eye className="w-4 h-4 text-primary" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm",
                "dark:hover:bg-red-900/50 dark:text-red-400 hover:bg-red-50 text-red-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <ThemeModal
              isOpen={deleteDialogOpen}
              title={education.school}
              onClose={() => setDeleteDialogOpen(false)}
              onConfirm={() => {
                deleteEducation(education.id);
                setExpandedId(null);
                setDeleteDialogOpen(false);
              }}
            />

            <motion.div
              initial={false}
              animate={{
                rotate: expandedId === education.id ? 180 : 0,
              }}
            >
              <ChevronDown
                className={cn("w-5 h-5", "text-muted-foreground")}
              />
            </motion.div>
          </div>
        </div>
        <AnimatePresence>
          {expandedId === education.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "px-4 pb-4 space-y-4",
                  "border-border"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={cn(
                    "h-px w-full",
                    "bg-border"
                  )}
                />
                <EducationEditor
                  education={education}
                  onSave={updateEducation}
                  onDelete={() => {
                    deleteEducation(education.id);
                    setExpandedId(null);
                  }}
                  onCancel={() => setExpandedId(null)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reorder.Item>
  );
};

export default EducationItem;
