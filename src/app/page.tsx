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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

const taskSchema = z.object({
  employee_name: z.string(),
  task_description: z.string(),
  date: z.string(),
  hours_spent: z.number(),
  hourly_rate: z.number(),
  additional_charges: z.number(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { register, handleSubmit, reset } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormValues) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_ENDPOINT}api/tasks`, data);
      reset();
      // Refresh data
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}api/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };


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
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">Create Task</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Employee Name</Label>
              <Input {...register('employee_name')} />
            </div>
            <div>
              <Label>Task Description</Label>
              <Input {...register('task_description')} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" {...register('date')} />
            </div>
            <div>
              <Label>Hours Spent</Label>
              <Input type="number" {...register('hours_spent', { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Hourly Rate</Label>
              <Input type="number" step="0.01" {...register('hourly_rate', { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Additional Charges</Label>
              <Input type="number" step="0.01" {...register('additional_charges', { valueAsNumber: true })} />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
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