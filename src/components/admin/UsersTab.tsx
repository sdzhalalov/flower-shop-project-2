import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

interface UsersTabProps {
  users: User[];
}

const UsersTab: React.FC<UsersTabProps> = ({ users }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Управление пользователями</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Логин</TableHead>
            <TableHead>Роль</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                <Badge
                  variant={user.role === "admin" ? "destructive" : "secondary"}
                >
                  {user.role === "admin" ? "Администратор" : "Модератор"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTab;
