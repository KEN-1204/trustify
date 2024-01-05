import useDashboardStore from "@/store/useDashboardStore";
import { Product } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  company_id: string | null | undefined;
  userId?: string | null;
  departmentId?: string | null;
  unitId?: string | null;
  officeId?: string | null;
  isReady?: boolean;
};

export const useQueryProducts = ({ company_id, userId, departmentId, unitId, officeId, isReady = true }: Props) => {
  // const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const supabase = useSupabaseClient();

  const getProducts = async () => {
    if (!company_id) return;

    const isAll = company_id && !departmentId && !unitId && !officeId;
    const isDepartment = company_id && departmentId && !unitId && !officeId;
    const isDepartmentUnit = company_id && departmentId && unitId && !officeId;
    const isDepartmentUnitOffice = company_id && departmentId && unitId && officeId;
    const isDepartmentOffice = company_id && departmentId && !unitId && officeId;
    const isUnitOffice = company_id && !departmentId && unitId && officeId;
    const isUnit = company_id && !departmentId && unitId && !officeId;
    const isOffice = company_id && !departmentId && !unitId && officeId;

    let response;
    if (isAll) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .order("product_name", { ascending: true });

      if (error) {
        // alert(error.message);
        console.error("getProductsFreeエラー発生", isAll, error.message);
        // setLoadingGlobalState(false);
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
        // alert(error.message);
        console.error("getProductsFreeエラー発生", error.message, isDepartment);
        // setLoadingGlobalState(false);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isDepartmentUnit) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_department_of_user", departmentId)
        .eq("created_by_unit_of_user", unitId)
        .order("product_name", { ascending: true });

      if (error) {
        // alert(error.message);
        console.error("getProductsFreeエラー発生", error.message, isDepartmentUnit);
        // setLoadingGlobalState(false);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isDepartmentUnitOffice) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_department_of_user", departmentId)
        .eq("created_by_unit_of_user", unitId)
        .eq("created_by_office_of_user", officeId)
        .order("product_name", { ascending: true });

      if (error) {
        // alert(error.message);
        console.error("getProductsFreeエラー発生", error.message, isDepartmentUnitOffice);
        // setLoadingGlobalState(false);
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
        // alert(error.message);
        console.error("getProductsFreeエラー発生", error.message, isDepartmentOffice);
        // setLoadingGlobalState(false);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isUnitOffice) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_unit_of_user", unitId)
        .eq("created_by_office_of_user", officeId)
        .order("product_name", { ascending: true });

      if (error) {
        // alert(error.message);
        console.error("getProductsFreeエラー発生", error.message, isUnitOffice);
        // setLoadingGlobalState(false);
        throw new Error(error.message);
      }
      response = data;
    }
    if (isUnit) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("created_by_company_id", company_id)
        .eq("created_by_unit_of_user", unitId)
        .order("product_name", { ascending: true });

      if (error) {
        // alert(error.message);
        console.error("getProductsFreeエラー発生", error.message, isUnit);
        // setLoadingGlobalState(false);
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
        // alert(error.message);
        console.error("getProductsFreeエラー発生", error.message, isOffice);
        // setLoadingGlobalState(false);
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
    queryKey: ["products", departmentId, unitId, officeId],
    queryFn: getProducts,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryProducts error:", error);
    },
    enabled: !!company_id && isReady,
  });
};
