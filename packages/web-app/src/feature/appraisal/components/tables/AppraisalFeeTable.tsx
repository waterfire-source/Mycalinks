import { AppraisalFeeTableContent } from '@/feature/appraisal/components/tables/AppraisalFeeTableContent';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { getAppraisalApi } from 'api-generator';
import { useEffect, useState } from 'react';
import { useAppraisal } from '@/feature/appraisal/hooks/useAppraisal';
import z from 'zod';

type AppraisalResponse = z.infer<typeof getAppraisalApi.response>;
type AppraisalItem = AppraisalResponse['appraisals'][number];

export type AppraisalFeeData = {
  description: string;
  shippingFee: number;
  insuranceFee: number;
  handlingFee: number;
  otherFee: number;
};

type Props = {
  appraisal: AppraisalItem;
};

export const AppraisalFeeTable = ({ appraisal }: Props) => {
  const { handleError } = useErrorAlert();
  const { updateAppraisal: updateAppraisalApi } = useAppraisal();

  const [feeData, setFeeData] = useState<AppraisalFeeData>({
    description: '',
    shippingFee: 0,
    insuranceFee: 0,
    handlingFee: 0,
    otherFee: 0,
  });

  const updateFeeData = <K extends keyof AppraisalFeeData>(
    key: K,
    value: AppraisalFeeData[K],
  ) => {
    setFeeData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFeeData = async () => {
    try {
      await updateAppraisalApi({
        appraisal_id: appraisal.id,
        description: feeData.description,
        shipping_fee: feeData.shippingFee,
        insurance_fee: feeData.insuranceFee,
        handling_fee: feeData.handlingFee,
        other_fee: feeData.otherFee,
      });
    } catch (err) {
      handleError(err);
    }
  };

  useEffect(() => {
    if (!appraisal) return;

    setFeeData({
      description: appraisal.description ?? '',
      shippingFee: appraisal.shipping_fee,
      insuranceFee: appraisal.insurance_fee,
      handlingFee: appraisal.handling_fee,
      otherFee: appraisal.other_fee,
    });
  }, [appraisal]);

  return (
    <AppraisalFeeTableContent
      feeData={feeData}
      updateFeeData={updateFeeData}
      applyFeeData={applyFeeData}
    />
  );
};
