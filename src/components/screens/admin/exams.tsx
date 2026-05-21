'use client';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { 
  TabLoadingSkeleton, 
  formatDate, 
  formatTime, 
  getStatusBadge, 
  getExamTypeBadge 
} from './exams/utils';

// Sub-components
import { ExamsHeader } from './exams/ExamsHeader';
import { ExamDialogs } from './exams/ExamDialogs';
import { ViewResultsDialog } from './exams/ViewResultsDialog';
import { ActiveExamsView } from './exams/ActiveExamsView';
import { PublishedResultsView } from './exams/PublishedResultsView';
import { TabulationLedgerPreviewPage } from './exams/TabulationLedgerPreviewPage';
import { useExamsState } from './exams/useExamsState';

// Dynamic loading for "Low Stack" performance optimization
const ResultsView = dynamic(() => import('./exams/ResultsView').then(m => m.ResultsView), {
  loading: () => <TabLoadingSkeleton />
});

export function AdminExams({ initialTab = 'exams' }: { initialTab?: string }) {
  const state = useExamsState(initialTab);

  return (
    <div className="space-y-6">
      <ExamsHeader 
        activeTab={state.activeTab} 
        onNewExamClick={() => state.setAddOpen(true)} 
      />

      <Tabs value={state.activeTab} onValueChange={(v) => v === 'exams' ? state.backToExams() : state.setActiveTab(v)}>

        <TabsContent value="exams" className="space-y-6">
          <ActiveExamsView
            exams={state.exams}
            classes={state.classes}
            loadingExams={state.loadingExams}
            deleting={state.deleting}
            handleDelete={state.handleDelete}
            setEditForm={state.setEditForm}
            setEditOpen={state.setEditOpen}
            handleOpenViewResults={state.handleOpenViewResults}
            formatDate={formatDate}
            formatTime={formatTime}
            getStatusBadge={getStatusBadge}
            getExamTypeBadge={getExamTypeBadge}
            classFilter={state.classFilter}
            setClassFilter={state.setClassFilter}
          />
        </TabsContent>

        <TabsContent value="results">
          <ResultsView
            selectedExam={state.selectedExam} 
            exams={state.resultsExams} 
            classes={state.classes} 
            resultsClassId={state.resultsClassId}
            onResultsClassChange={state.handleResultsClassChange}
            resultRows={state.resultRows}
            loadingStudents={state.loadingStudents} 
            savingResults={state.savingResults}
            onBack={state.backToExams} 
            onSelectExam={state.openResultsEntry}
            onSave={state.handleSaveResults} 
            onPublish={state.handlePublish} 
            isPublishing={state.isPublishing}
            onUpdateMark={(id, m) => state.setResultRows(prev => prev.map(r => r.studentId === id ? { ...r, marksObtained: m, status: Number(m) >= (state.selectedExam?.passingMarks || 40) ? 'pass' : 'fail' } : r))}
            formatDate={formatDate} 
            formatTime={formatTime}
            getStatusBadge={getStatusBadge} 
            getExamTypeBadge={getExamTypeBadge}
          />
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          {state.previewingLedgerClass ? (
            <TabulationLedgerPreviewPage
              classId={state.previewingLedgerClass.id}
              classNameStr={state.previewingLedgerClass.name}
              classSection={state.previewingLedgerClass.section}
              academicYear={state.publishedAcademicYearFilter || state.currentAcademicYear}
              initialTemplateId={state.previewingLedgerClass.templateId}
              examName={state.previewingLedgerClass.examName}
              onBack={() => state.setPreviewingLedgerClass(null)}
            />
          ) : (
            <PublishedResultsView
              exams={state.exams}
              classes={state.classes}
              academicYears={state.academicYears}
              currentAcademicYear={state.currentAcademicYear}
              publishedAcademicYearFilter={state.publishedAcademicYearFilter}
              setPublishedAcademicYearFilter={state.setPublishedAcademicYearFilter}
              publishedClassFilter={state.publishedClassFilter}
              setPublishedClassFilter={state.setPublishedClassFilter}
              printingLedgerClassId={state.printingLedgerClassId}
              handlePrintTabularLedger={state.handlePrintTabularLedger}
              loadingExams={state.loadingExams}
              deleting={state.deleting}
              handleDelete={state.handleDelete}
              setEditForm={state.setEditForm}
              setEditOpen={state.setEditOpen}
              handleOpenViewResults={state.handleOpenViewResults}
              formatDate={formatDate}
              formatTime={formatTime}
              getStatusBadge={getStatusBadge}
              getExamTypeBadge={getExamTypeBadge}
            />
          )}
        </TabsContent>
      </Tabs>

      <ExamDialogs
        addOpen={state.addOpen} 
        setAddOpen={state.setAddOpen} 
        addForm={state.addForm} 
        setAddForm={state.setAddForm} 
        adding={state.adding} 
        onAdd={state.handleCreate}
        editOpen={state.editOpen} 
        setEditOpen={state.setEditOpen} 
        editForm={state.editForm} 
        setEditForm={state.setEditForm} 
        saving={state.saving} 
        onSave={state.handleUpdate}
        classes={state.classes} 
        subjects={state.subjects} 
        subjectsForClass={state.bulkSubjectsForClass} 
        editSubjectsForClass={[]}
        bulkRows={state.bulkRows} 
        selectedBulkCount={state.bulkSelected.size}
        toggleAllBulk={(c) => state.setBulkSelected(c ? new Set(state.bulkSubjectsForClass.map(s => s.id)) : new Set())}
        toggleBulkSubject={state.toggleBulkSubject} 
        updateBulkField={state.updateBulkField}
        academicYears={state.academicYears}
        currentAcademicYear={state.currentAcademicYear}
      />

      <ViewResultsDialog
        open={state.viewResultsOpen}
        onOpenChange={state.setViewResultsOpen}
        exam={state.viewResultsExam}
        results={state.viewResultsData}
        loading={state.loadingViewResults}
        formatDate={formatDate}
        formatTime={formatTime}
      />

    </div>
  );
}
