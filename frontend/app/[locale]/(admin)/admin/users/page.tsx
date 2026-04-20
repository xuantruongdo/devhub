"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColumnType, CustomTable } from "@/components/ui/custom-table";
import userService from "@/services/user";
import Pagination from "@/components/ui/pagination";
import { PaginatedResponse } from "@/types";
import { User } from "@/types/user";
import { toastError } from "@/lib/toast";
import { LIMIT } from "@/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import moment from "moment";
import { RoleBadge } from "@/components/Admin/RoleBadge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useModal } from "@/hooks/useModal";
import { ExternalLink, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const { isOpen, openModal, closeModal } = useModal();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { t, locale } = useTranslation();

  const fetchUsers = async (pageNum: number, keyword?: string) => {
    try {
      setLoading(true);

      const { data } = await userService.findAll<PaginatedResponse<User>>({
        page: pageNum,
        limit: LIMIT,
        search: keyword,
      });

      setUsers(data.data);
      setTotal(data.total);
      setPage(data.page);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers(page, debouncedSearch);
  }, [page, debouncedSearch]);

  const handleVerify = async (id: number, value: boolean) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isVerified: value } : u)),
      );

      await userService.update(id, {
        isVerified: value,
      });
    } catch (error: any) {
      toastError(error);
      fetchUsers(page, debouncedSearch);
    }
  };

  const handleActive = async (id: number, value: boolean) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: value } : u)),
      );

      await userService.update(id, {
        isActive: value,
      });
    } catch (error: any) {
      toastError(error);
      fetchUsers(page, debouncedSearch);
    }
  };

  const handleDelete = async () => {
    try {
      if (!deleteId) return;

      await userService.delete(deleteId);

      closeModal();
      setDeleteId(null);

      fetchUsers(page, debouncedSearch);
    } catch (error: any) {
      toastError(error);
    }
  };

  const columns: ColumnType<User>[] = [
    {
      key: "fullName",
      title: "Name",
      dataIndex: "fullName",
      render: (_, record) => (
        <Link
          href={`/${locale}/${record.username}`}
          className="flex items-center gap-3 cursor-pointer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Avatar size="lg">
            {record.avatar ? (
              <AvatarImage src={record.avatar} />
            ) : (
              <AvatarFallback>{record.fullName.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <span className="font-medium">{record.fullName}</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      ),
    },
    {
      key: "username",
      title: "Username",
      dataIndex: "username",
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
    },
    {
      key: "role",
      title: "Role",
      dataIndex: "role",
      render: (v) => <RoleBadge role={v} />,
    },
    {
      key: "isVerified",
      title: "Verified",
      dataIndex: "isVerified",
      render: (value, record) => (
        <Switch
          checked={value}
          onCheckedChange={(checked) => handleVerify(record.id, checked)}
        />
      ),
    },
    {
      key: "isActive",
      title: "Status",
      dataIndex: "isActive",
      render: (value, record) => (
        <Switch
          checked={value}
          onCheckedChange={(checked) => handleActive(record.id, checked)}
        />
      ),
    },
    {
      key: "createdAt",
      title: "Joined",
      dataIndex: "createdAt",
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {moment(value).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (_, record) => (
        <div className="flex gap-2">
          {/* <Button variant={"outline"} size="sm">
            <SquarePen />
          </Button> */}

          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setDeleteId(record.id);
              openModal();
            }}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.users.title")}</CardTitle>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.users.search")}
            className="mt-3"
          />
        </CardHeader>
        <CardContent>
          <CustomTable
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
          />
          <Pagination
            current={page}
            total={total}
            pageSize={LIMIT}
            onChange={setPage}
          />
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={isOpen}
        title={t("admin.users.delete.title")}
        description={t("admin.users.delete.description")}
        onCancel={closeModal}
        onConfirm={handleDelete}
        cancelText={t("admin.users.delete.cancelButton")}
        confirmText={t("admin.users.delete.deleteButton")}
      />
    </div>
  );
}
