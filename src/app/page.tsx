'use client';

import { useEffect, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Toaster, toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Schema definition
const taskSchema = z.object({
  id: z.number().optional(),
  employee_name: z.string().min(1, "Employee name is required"),
  task_description: z.string().min(1, "Task description is required"),
  date: z.string().min(1, "Date is required"),
  hours_spent: z.number().min(0, "Hours must be 0 or greater"),
  hourly_rate: z.number().min(0, "Rate must be 0 or greater"),
  additional_charges: z.number().min(0, "Additional charges must be 0 or greater"),
  total_remuneration: z.number().min(0, "Total must be 0 or greater"),
});

type Task = z.infer<typeof taskSchema> & { id: number };

// Utility functions
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Invalid date:', dateString);
    return dateString;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const calculateTotalRemuneration = (
  hoursSpent: number,
  hourlyRate: number,
  additionalCharges: number
): number => {
  const baseAmount = hoursSpent * hourlyRate;
  const total = baseAmount + additionalCharges;
  return Math.round(total * 100) / 100;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const form = useForm<Task>({
    resolver: zodResolver(taskSchema) as Resolver<Task>,
    defaultValues: {
      employee_name: '',
      task_description: '',
      date: new Date().toISOString().split('T')[0],
      hours_spent: 0,
      hourly_rate: 0,
      additional_charges: 0,
      total_remuneration: 0,
    }
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT 
    ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}api/tasks` 
    : '/api/tasks';

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Calculate total remuneration when dependent fields change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'hours_spent' || name === 'hourly_rate' || name === 'additional_charges') {
        const hours = form.getValues('hours_spent') || 0;
        const rate = form.getValues('hourly_rate') || 0;
        const additional = form.getValues('additional_charges') || 0;
        
        const total = calculateTotalRemuneration(hours, rate, additional);
        form.setValue('total_remuneration', total);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Reset form when editing task changes
  useEffect(() => {
    if (editingTask && dialogOpen) {
      form.reset({
        ...editingTask,
        date: new Date(editingTask.date).toISOString().split('T')[0]
      });
    } else if (!dialogOpen) {
      form.reset();
      setEditingTask(null);
    }
  }, [editingTask, dialogOpen, form]);

  const onSubmit = async (data: Task) => {
    try {
      data.total_remuneration = calculateTotalRemuneration(
        data.hours_spent,
        data.hourly_rate,
        data.additional_charges
      );

      const url = editingTask 
        ? `${API_BASE_URL}/${editingTask.id}`
        : API_BASE_URL;
      
      const response = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      await fetchTasks();
      setDialogOpen(false);
      toast.success(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${taskToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      await fetchTasks();
      setTaskToDelete(null);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee tasks and calculate remuneration
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={() => {
            setEditingTask(null);
            setDialogOpen(true);
          }}
        >
          Create Task
        </Button>
      </header>

      {tasks.length === 0 ? (
        <div className="py-16 text-center border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-muted-foreground mt-1">Create a new task to get started</p>
        </div>
      ) : (
        <div className="rounded-md border animate-in fade-in-50 duration-300">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Task Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Additional</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="group transition-colors">
                  <TableCell className="font-medium">{task.employee_name}</TableCell>
                  <TableCell>{task.task_description}</TableCell>
                  <TableCell>{formatDate(task.date)}</TableCell>
                  <TableCell className="text-right">{task.hours_spent}</TableCell>
                  <TableCell className="text-right">{formatCurrency(task.hourly_rate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(task.additional_charges)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(task.total_remuneration)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingTask(task);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setTaskToDelete(task)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Task Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employee_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="task_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="hours_spent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Spent</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="additional_charges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="total_remuneration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Remuneration ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field}
                        disabled
                        className="bg-muted" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task for <span className="font-medium">{taskToDelete?.employee_name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="bottom-right" />
    </div>
  );
}