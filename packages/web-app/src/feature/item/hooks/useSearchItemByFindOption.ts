import { useMemo, useState } from 'react';

export type FindOptionType = {
  metaLabel: string;
  columnOnPosItem: string;
  options: {
    label: string;
    value: string;
  }[];
};

export type ChangeFindOptionType = {
  toggledValue: string;
  toggledLabel: string;
  metaLabel: string;
  columnOnPosItem: string;
};

/** 絞り込み選択肢を選択する*/
export const useSearchItemByFindOption = () => {
  const [selectedFindOption, setSelectedFindOption] = useState<
    FindOptionType[]
  >([]);

  const selectedFindOptionObject = useMemo(() => {
    return selectedFindOption.reduce(
      (acc, option) => {
        acc[option.columnOnPosItem] = option.options
          .map((opt) => opt.value)
          .join(',');
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [selectedFindOption]);

  const handleChangeFindOption = (values: ChangeFindOptionType) => {
    setSelectedFindOption((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.metaLabel === values.metaLabel,
      );

      if (existingIndex !== -1) {
        const existing = prev[existingIndex];
        const alreadyChecked = existing.options.some(
          (opt) => opt.value === values.toggledValue,
        );
        const updatedOptions = alreadyChecked
          ? existing.options.filter((opt) => opt.value !== values.toggledValue)
          : [
              ...existing.options,
              { label: values.toggledLabel, value: values.toggledValue },
            ];
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          options: updatedOptions,
        };
        if (updatedOptions.length === 0) {
          updated.splice(existingIndex, 1);
        }
        return updated;
      } else {
        return [
          ...prev,
          {
            metaLabel: values.metaLabel,
            columnOnPosItem: values.columnOnPosItem,
            options: [
              { label: values.toggledLabel, value: values.toggledValue },
            ],
          },
        ];
      }
    });
  };

  const handleResetSelectedFindOption = () => {
    setSelectedFindOption([]);
  };

  return {
    selectedFindOption,
    selectedFindOptionObject,
    handleChangeFindOption,
    handleResetSelectedFindOption,
  };
};
