interface AnnotatorReadonlyPanelProps {
  value: string
  placeholder: string
  fontFamily: string
  fontSize: number
}

export function AnnotatorReadonlyPanel({
  value,
  placeholder,
  fontFamily,
  fontSize,
}: AnnotatorReadonlyPanelProps) {
  return (
    <textarea
      readOnly
      aria-readonly
      value={value}
      className="flex-1 w-full resize-none bg-card p-5 text-foreground focus:outline-none focus:ring-0 border-none select-text cursor-default"
      style={{ fontFamily, fontSize: `${fontSize}px`, lineHeight: 1.8 }}
      placeholder={placeholder}
    />
  )
}
