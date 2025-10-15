// src/contexts/FormErrorContext.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAlert } from '@/contexts/AlertContext';

interface FormErrorContextProps {
  showFieldError: (fieldName: string, message: string) => void;
  showMultipleErrors: (
    errors: Array<{ field: string; message: string }>,
  ) => void;
}

interface FormErrorContextValue extends FormErrorContextProps {
  fieldNameMap: FieldNameMap;
}

const FormErrorContext = createContext<FormErrorContextValue | undefined>(
  undefined,
);

interface FormErrorProviderProps {
  children: ReactNode;
  fieldNameMap: FieldNameMap; // フォームごとに異なるマッピングを渡せるようにする
}

export const FormErrorProvider: React.FC<FormErrorProviderProps> = ({
  children,
  fieldNameMap,
}) => {
  const formMethods = useFormContext();
  const { setAlertState } = useAlert();

  // フォームのエラー監視
  useEffect(() => {
    if (!formMethods) return;

    // formState自体を依存配列に含めることで変更を検知する
    const errorEntries = Object.entries(formMethods.formState.errors);
    if (errorEntries.length > 0) {
      const errorMessages = errorEntries
        .filter(
          ([_, error]) =>
            error !== undefined && error !== null && error.message,
        )
        .map(([field, error]) => ({
          field,
          message: (error as any)?.message as string,
        }))
        .filter((item) => item.message);

      if (errorMessages.length > 0) {
        setAlertState({
          message: formatErrorMessages(errorMessages, fieldNameMap),
          severity: 'error',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods?.formState.errors]);

  // 単一のフィールドエラーを表示
  const showFieldError = (fieldName: string, message: string) => {
    setAlertState({
      message: `${getFieldDisplayName(fieldName, fieldNameMap)}: ${message}`,
      severity: 'error',
    });

    // フォームのエラーステートも更新
    if (formMethods) {
      formMethods.setError(fieldName as any, {
        type: 'manual',
        message,
      });
    }
  };

  // 複数のエラーをまとめて表示
  const showMultipleErrors = (
    errors: Array<{ field: string; message: string }>,
  ) => {
    setAlertState({
      message: formatErrorMessages(errors, fieldNameMap),
      severity: 'error',
    });

    // フォームのエラーステートも更新
    if (formMethods) {
      errors.forEach(({ field, message }) => {
        formMethods.setError(field as any, {
          type: 'manual',
          message,
        });
      });
    }
  };

  return (
    <FormErrorContext.Provider
      value={{ showFieldError, showMultipleErrors, fieldNameMap }}
    >
      {children}
    </FormErrorContext.Provider>
  );
};

// カスタムフックで使用するために型情報を追加
export const useFormError = (): FormErrorContextProps => {
  const context = useContext(FormErrorContext);
  if (!context) {
    throw new Error('useFormError must be used within a FormErrorProvider');
  }
  return {
    showFieldError: context.showFieldError,
    showMultipleErrors: context.showMultipleErrors,
  };
};

// フィールド名マッピングを取得するためのカスタムフック
export const useFieldNameMap = (): FieldNameMap => {
  const context = useContext(FormErrorContext);
  if (!context) {
    throw new Error('useFieldNameMap must be used within a FormErrorProvider');
  }
  return context.fieldNameMap;
};

export function getFieldDisplayName(
  fieldName: string,
  fieldNameMap: FieldNameMap,
): string {
  return fieldNameMap[fieldName] || fieldName;
}

// フォームのエラーメッセージをフォーマットするヘルパー関数
export function formatErrorMessages(
  errors: Array<{ field: string; message: string }>,
  fieldNameMap: FieldNameMap,
): string {
  return errors
    .map(
      ({ field, message }) =>
        `${getFieldDisplayName(field, fieldNameMap)}: ${message}`,
    )
    .join('\n');
}

export interface FieldNameMap {
  [key: string]: string;
}
