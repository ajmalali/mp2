import styles from './FilterGroup.module.css';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

export default function FilterGroup({ title, options, selected, onToggle }: FilterGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>
        {title}
        {selected.length > 0 && <span className={styles.selectedCount}>{selected.length}</span>}
      </legend>
      <div className={styles.chips}>
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              className={styles.chip}
              aria-pressed={isSelected}
              onClick={() => onToggle(option.value)}
            >
              {isSelected && (
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
              )}
              {option.label}
              {option.count !== undefined && <span className={styles.count}>{option.count}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
