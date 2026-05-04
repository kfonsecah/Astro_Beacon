import type {
    CreateSuministroDTO,
    Suministro,
    SuministroConDistancia
} from "@/types-dtos";
import { api } from "./api";

/**
 * PaginatedSupplies defines the structure for paginated supply lists.
 */
export interface PaginatedSupplies {
  items: Suministro[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * SupplyService interface defines all available operations for managing supplies.
 * This includes listing, viewing details, collecting supplies, and finding nearby supplies by location.
 */
export interface SupplyService {
  getAll(
    page?: number,
    limit?: number,
    status?: string,
  ): Promise<PaginatedSupplies>;
  getById(supplyId: string): Promise<Suministro | null>;
  create(data: CreateSuministroDTO): Promise<Suministro>;
  collect(supplyId: string, data?: { notes?: string }): Promise<Suministro>;
  getNearby(
    lat: number,
    lng: number,
    radius?: number,
    status?: string,
  ): Promise<SuministroConDistancia[]>;
}

type SupplyApiItem = Suministro & { _id?: string };

function normalizeSupply(item: SupplyApiItem): Suministro {
  return {
    ...item,
    id: item.id || item._id || "",
  };
}

export const supplyService: SupplyService = {
  async getAll(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaginatedSupplies> {
    const response = await api.get<{
      success: boolean;
      data: SupplyApiItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/supplies`, {
      params: { page, limit, status },
    });

    return {
      items: response.data.data.map(normalizeSupply),
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
    };
  },

  async getById(supplyId: string): Promise<Suministro | null> {
    const response = await api.get<{
      success: boolean;
      data: SupplyApiItem | null;
    }>(`/supplies/${supplyId}`);
    return response.data.data ? normalizeSupply(response.data.data) : null;
  },

  async create(data: CreateSuministroDTO): Promise<Suministro> {
    const response = await api.post<{ success: boolean; data: SupplyApiItem }>(
      "/supplies",
      data,
    );
    return normalizeSupply(response.data.data);
  },

  async collect(
    supplyId: string,
    data?: { notes?: string },
  ): Promise<Suministro> {
    const response = await api.post<{ success: boolean; data: SupplyApiItem }>(
      `/supplies/${supplyId}/collect`,
      data,
    );
    return normalizeSupply(response.data.data);
  },

  async getNearby(
    lat: number,
    lng: number,
    radius = 5000,
    status?: string,
  ): Promise<SuministroConDistancia[]> {
    const response = await api.get<{
      success: boolean;
      data: SuministroConDistancia[];
    }>(`/supplies/nearby`, {
      params: { lat, lng, radius, status },
    });
    return response.data.data;
  },
};
