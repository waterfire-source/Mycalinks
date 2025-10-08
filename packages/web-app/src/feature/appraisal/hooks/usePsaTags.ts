import { useEffect, useState } from 'react';
import { Tag, useTags } from '@/feature/settings/tag/hooks/useTags';
import { TAG_GENRE1_METHOD } from '@/api/frontend/product/implement';
import { ConditionField } from '@/api/frontend/store/api';
import { useCategory } from '@/feature/category/hooks/useCategory';

interface UsePsaTagsReturn {
  appraisalResultTags: Tag[];
  conditions: Omit<ConditionField, 'conditionOptions'>[];
  isLoading: boolean;
}

export const usePsaTags = (
  appraisalCompanyName: string | undefined | null,
  storeId: number | undefined,
): UsePsaTagsReturn => {
  const { getTags } = useTags();
  const { category, fetchCategoryList } = useCategory();
  const [appraisalResultTags, setAppraisalResultTags] = useState<Tag[]>([]);
  const [conditions, setConditions] = useState<ConditionField[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      if (appraisalCompanyName && storeId) {
        setIsLoading(true);

        // 鑑定結果用のタグを取得
        const appraisalResultTagsData = await getTags({
          storeID: storeId,
          genre1: TAG_GENRE1_METHOD.APPRAISAL,
          includesAuto: true,
        });

        if (Array.isArray(appraisalResultTagsData)) {
          const filteredAppraisalResultTags = appraisalResultTagsData.filter(
            (tag) => tag.genre2 === appraisalCompanyName,
          );
          setAppraisalResultTags(filteredAppraisalResultTags);
        }

        await fetchCategoryList();

        setIsLoading(false);
      }
    };

    fetchTags();
  }, [appraisalCompanyName, storeId, getTags]);

  useEffect(() => {
    if (!category) return;
    setConditions(
      category?.condition_options.map(
        (option: { id: number; handle: string; display_name: string }) => ({
          id: option.id,
          storeID: storeId,
          handle: option.handle,
          displayName: option.display_name,
        }),
      ) ?? [],
    );
  }, [category, storeId]);

  return { appraisalResultTags, conditions, isLoading };
};
