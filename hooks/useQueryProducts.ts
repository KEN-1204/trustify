import useDashboardStore from "@/store/useDashboardStore";
import { Product } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  company_id: string | null | undefined;
  userId?: string | null;
  departmentId?: string | null;
  sectionId?: string | null;
  unitId?: string | null;
  officeId?: string | null;
  isReady?: boolean;
};

export const useQueryProducts = ({
  company_id,
  userId,
  departmentId,
  sectionId,
  unitId,
  officeId,
  isReady = true,
}: Props) => {
  const supabase = useSupabaseClient();

  const getProducts = async () => {
    if (!company_id) return;

    const isAll = company_id && !departmentId && !sectionId && !unitId && !officeId;
    const isDepartment = company_id && departmentId && !sectionId && !unitId && !officeId;
    const isDepartmentSection = company_id && departmentId && sectionId && !unitId && !officeId;
    const isDepartmentSectionUnit = company_id && departmentId && sectionId && unitId && !officeId;
    const isDepartmentOffice = company_id && departmentId && !sectionId && !unitId && officeId;
    const isDepartmentSectionOffice = company_id && departmentId && sectionId && !unitId && officeId;
    const isDepartmentSectionUnitOffice = company_id && departmentId && sectionId && unitId && officeId;
    const isOffice = company_id && !departmentId && !sectionId && !unitId && officeId;
    // const isSection = company_id && departmentId && !sectionId && !unitId && !officeId;
    // const isUnit = company_id && !departmentId && unitId && !officeId;
    // const isUnitOffice = company_id && !departmentId && unitId && officeId;

    let response;
    if (isAll) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .order("product_name", { ascending: true });

      if (error) {
        console.error("getProductsFreeエラー発生", isAll, error.message);
        throw new Error(error.message);
      }
      response = data;
    }

    if (isDepartment) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_department_of_user", departmentId)
        .order("product_name", { ascending: true });

      if (error) {
        console.error("getProductsFreeエラー発生", error.message, isDepartment);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isDepartmentSection) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_department_of_user", departmentId)
        .eq("created_by_section_of_user", sectionId)
        .order("product_name", { ascending: true });

      if (error) {
        console.error("getProductsFreeエラー発生", error.message, isDepartmentSection);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isDepartmentSectionUnit) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_department_of_user", departmentId)
        .eq("created_by_section_of_user", sectionId)
        .eq("created_by_unit_of_user", unitId)
        .order("product_name", { ascending: true });

      if (error) {
        console.error("getProductsFreeエラー発生", error.message, isDepartmentSectionUnit);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isDepartmentOffice) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_department_of_user", departmentId)
        .eq("created_by_office_of_user", officeId)
        .order("product_name", { ascending: true });

      if (error) {
        console.error("getProductsFreeエラー発生", error.message, isDepartmentOffice);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isDepartmentSectionOffice) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_department_of_user", departmentId)
        .eq("created_by_section_of_user", sectionId)
        .eq("created_by_office_of_user", officeId)
        .order("product_name", { ascending: true });

      if (error) {
        console.error("getProductsFreeエラー発生", error.message, isDepartmentSectionOffice);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isDepartmentSectionUnitOffice) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_section_of_user", sectionId)
        .eq("created_by_unit_of_user", unitId)
        .eq("created_by_office_of_user", officeId)
        .order("product_name", { ascending: true });

      if (error) {
        console.error("getProductsFreeエラー発生", error.message, isDepartmentSectionUnitOffice);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isOffice) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_office_of_user", officeId)
        .order("product_name", { ascending: true });

      if (error) {
        console.error("getProductsFreeエラー発生", error.message, isOffice);
        throw new Error(error.message);
      }
      response = data;
    }

    // setLoadingGlobalState(false);

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 800));

    return response as Product[];
    // return data as Product[];
  };

  return useQuery({
    queryKey: ["products", departmentId, sectionId, unitId, officeId],
    queryFn: getProducts,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryProducts error:", error);
    },
    enabled: !!company_id && isReady,
  });
};
