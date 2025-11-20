export function JsonPreview({
  value,
  placeholder,
  className,
}: {
  value: string;
  placeholder?: string;
  className?: string;
}) {
  if (!value) {
    return placeholder ? <div className={className}>{placeholder}</div> : null;
  }

  if (typeof value !== 'string') {
    return <div className={className}>{value}</div>;
  }

  let prettyValue: string | null = null;
  try {
    const json = JSON.parse(value);
    prettyValue = JSON.stringify(json, null, 2);
  } catch (error) {
    prettyValue = null;
  }

  if (prettyValue) {
    return <pre className={className}>{prettyValue}</pre>;
  }

  return <div className={className}>{value}</div>;
}
