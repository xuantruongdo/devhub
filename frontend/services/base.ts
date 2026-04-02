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

  async create<TCreate, TResult>(
    data: TCreate,
  ): Promise<AxiosResponse<TResult>> {
    return await instance.post<TResult>(this.route, data);
  }

  async update<TUpdate, TResult>(
    id: number | string,
    data: TUpdate,
  ): Promise<AxiosResponse<TResult>> {
    return await instance.put<TResult>(`${this.route}/${id}`, data);
  }

  async delete<T>(id: number | string): Promise<AxiosResponse<T>> {
    return await instance.delete<T>(`${this.route}/${id}`);
  }
}
