'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Task {
  id: number;
  employee_name: string;
  task_description: string;
  date: string;
  hours_spent: number;
  hourly_rate: number;
  additional_charges: number;
  total_remuneration: number;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}api/tasks`);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Tasks</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee Name</TableHead>
            <TableHead>Task Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Hours Spent</TableHead>
            <TableHead>Hourly Rate</TableHead>
            <TableHead>Additional Charges</TableHead>
            <TableHead>Total Remuneration</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.employee_name}</TableCell>
              <TableCell>{task.task_description}</TableCell>
              <TableCell>{task.date}</TableCell>
              <TableCell>{task.hours_spent}</TableCell>
              <TableCell>{task.hourly_rate}</TableCell>
              <TableCell>{task.additional_charges}</TableCell>
              <TableCell>{task.total_remuneration}</TableCell>
              <TableCell>
                <Button variant="outline" className="mr-2">
                  Edit
                </Button>
                <Button variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}