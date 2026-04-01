import instance from "@/lib/api";
import { AxiosResponse } from "axios";

export class BaseService {
  protected route: string;

  constructor(route: string) {
    this.route = route;
  }

  async findAll<T>(params?: unknown): Promise<AxiosResponse<T>> {
    return await instance.get<T>(this.route, { params });
  }

  async findOne<T>(id: number | string): Promise<AxiosResponse<T>> {
    return await instance.get<T>(`${this.route}/${id}`);
  }

  async create<T>(data: Omit<T, "id">): Promise<AxiosResponse<T>> {
    return await instance.post<T>(this.route, data);
  }

  async update<T>(
    id: number | string,
    data: Partial<T>
  ): Promise<AxiosResponse<T>> {
    return await instance.put<T>(`${this.route}/${id}`, data);
  }

  async delete<T>(id: number | string): Promise<AxiosResponse<T>> {
    return await instance.delete<T>(`${this.route}/${id}`);
  }
}
