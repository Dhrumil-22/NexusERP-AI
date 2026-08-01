import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export function CustomSelect({
  value,
  onChange,
  options,
  children,
  className = "",
  style,
  multiple,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse options from children if provided, otherwise use options prop
  const parsedOptions = options || [];
  if (children) {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === "option") {
        parsedOptions.push({
          label: child.props.children,
          value:
            child.props.value !== undefined
              ? child.props.value
              : child.props.children,
        });
      }
    });
  }

  const selectedOptions = multiple
    ? parsedOptions.filter((o) => (value || []).includes(o.value))
    : parsedOptions.filter((o) => o.value === value);

  let displayLabel = "Select...";
  if (selectedOptions.length > 0) {
    if (multiple) {
      displayLabel =
        selectedOptions.map((o) => o.label).join(", ") || "Select...";
    } else {
      displayLabel = selectedOptions[0].label;
    }
  }

  const handleSelect = (val) => {
    let newValue = val;
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(val)) {
        newValue = currentValues.filter((v) => v !== val);
      } else {
        newValue = [...currentValues, val];
      }
    }

    if (onChange) {
      // Create a proxy event object that works with both e.target.value and direct value
      onChange({ target: { value: newValue, name: props.name } }, newValue);
    }
  };
  return (
    <div
      ref={ref}
      className={`relative inline-block min-w-[140px] ${className.includes("w-") ? "" : "w-auto"} ${className}`}
      style={style}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full text-left transition-all hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          className.includes("px-") ? "" : "px-3 py-2"
        } ${className.includes("bg-") ? "" : "bg-card"} ${
          className.includes("border") ? "" : "border border-border rounded-lg"
        }`}
      >
        <span className="truncate mr-2 flex-1">{displayLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 opacity-70 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1.5 bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden glass-panel animate-slide-up origin-top">
          <ul className="max-h-60 overflow-auto py-1">
            {parsedOptions.map((option, i) => {
              const isSelected = multiple
                ? (value || []).includes(option.value)
                : value === option.value;
              return (
                <li
                  key={option.value || i}
                  onClick={() => {
                    handleSelect(option.value);
                    if (!multiple) setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-all mx-1 rounded-md ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-card-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="truncate mr-2">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
