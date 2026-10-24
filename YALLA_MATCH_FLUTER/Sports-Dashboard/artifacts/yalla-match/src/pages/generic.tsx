import React from 'react';
import { AppLayout } from '@/components/layout';

export default function GenericPage({ title, description }: { title: string, description: string }) {
  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex-1 rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/10">
          <div className="text-center">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-sm text-muted-foreground mt-1">This module is under development.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
