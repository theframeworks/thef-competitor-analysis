export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

const btnIcon =
  ":[.ti]:inline-flex :[.ti]:items-center :[.ti]:justify-center :[.ti]:shrink-0 :[.ti]:leading-none :[.ti]:w-3.5";

/** Layout-only — never combine with conflicting size/color/radius utilities. */
const btnLayout = cn(
  "inline-flex items-center gap-1.5 border border-solid font-medium font-inherit cursor-pointer whitespace-nowrap transition-colors transition-transform duration-150 disabled:opacity-45 disabled:cursor-not-allowed active:not-disabled:scale-95",
  btnIcon,
);

export const btnPillAccentSmall = cn(
  btnLayout,
  "rounded-full tracking-tight px-3 py-1.5 text-xs border-accent-border bg-accent-dim text-accent",
  ":[.ti]:text-sm :[.ti]:opacity-95 active:not-disabled:scale-100",
  "hover:not-disabled:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] hover:not-disabled:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] hover:not-disabled:text-accent-strong",
);

export const btnPillNeutralSmall = cn(
  btnLayout,
  "rounded-full tracking-tight px-3 py-1.5 text-xs border-border bg-btn-neutral text-text-2",
  ":[.ti]:text-sm :[.ti]:opacity-95 active:not-disabled:scale-100",
  "hover:not-disabled:bg-btn-neutral-hover hover:not-disabled:border-border-strong hover:not-disabled:text-text-1",
);

export const btnPillNeutralIcon = cn(
  btnLayout,
  "rounded-full size-8 border-border bg-btn-neutral p-2 text-text-2",
  ":[.ti]:text-sm :[.ti]:opacity-95 active:not-disabled:scale-100",
  "hover:not-disabled:bg-btn-neutral-hover hover:not-disabled:border-border-strong hover:not-disabled:text-text-1",
);

export const btnPillDangerIcon = cn(
  btnLayout,
  "rounded-full size-8 border-[color-mix(in_srgb,var(--color-red)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-red)_12%,transparent)] p-2 text-red",
  ":[.ti]:text-sm :[.ti]:opacity-100 active:not-disabled:scale-100",
  "hover:not-disabled:bg-[color-mix(in_srgb,var(--color-red)_18%,transparent)] hover:not-disabled:border-[color-mix(in_srgb,var(--color-red)_40%,transparent)] hover:not-disabled:text-red",
);

export const btnThemeToggleIcon = cn(
  btnLayout,
  "rounded-full size-8 border-transparent bg-transparent p-2 text-text-2",
  ":[.ti]:text-sm :[.ti]:opacity-95 active:not-disabled:scale-100",
  "hover:not-disabled:bg-btn-neutral-hover",
);

export const btnThemeToggleIconActive = cn(
  btnLayout,
  "rounded-full size-8 border-accent-border bg-accent-dim p-2 text-accent",
  ":[.ti]:text-sm :[.ti]:opacity-95 active:not-disabled:scale-100",
  "hover:not-disabled:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] hover:not-disabled:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] hover:not-disabled:text-accent-strong",
);

export const btnBack = cn(
  "inline-flex items-center gap-1.5 self-start w-auto border-0 bg-transparent p-0 font-inherit text-sm text-text-2 cursor-pointer transition-colors duration-150",
  "hover:not-disabled:text-text-1 active:not-disabled:scale-100",
);

export const btnTab = cn(
  btnLayout,
  "rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm text-text-3",
  "active:not-disabled:scale-100",
  "hover:not-disabled:border-transparent hover:not-disabled:bg-transparent hover:not-disabled:text-text-2",
);

export const btnTabActive = cn(
  btnLayout,
  "rounded-none border-0 border-b-2 border-b-accent bg-transparent px-4 py-2.5 text-sm font-semibold text-accent",
  "active:not-disabled:scale-100",
  "hover:not-disabled:border-b-accent hover:not-disabled:bg-transparent hover:not-disabled:text-accent",
);

export const fieldBase = cn(
  "rounded-lg border border-solid border-border-strong bg-bg-input px-3 py-2 text-sm text-text-1 font-inherit outline-none transition-colors duration-150 focus:border-accent placeholder:text-text-3",
);

export const textareaBase = cn(fieldBase, "resize-y leading-relaxed");

export const selectBase = cn(fieldBase, "[&_option]:bg-bg-input");
