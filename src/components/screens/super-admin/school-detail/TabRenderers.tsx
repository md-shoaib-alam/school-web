import { TableCell, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  statusColors, 
  TabType, 
  Student, 
  Teacher, 
  Parent, 
  Class, 
  Fee, 
  Attendance, 
  Notice 
} from "./types";
import { IndianRupee, Clock, UserCircle, ShieldAlert } from "lucide-react";

export function renderTableHeaders(activeTab: TabType) {
  const commonClasses = "uppercase tracking-widest text-[10px] font-black text-muted-foreground py-4";
  switch (activeTab) {
    case "students":
      return (
        <>
          <TableHead className={commonClasses}>Student Name</TableHead>
          <TableHead className={commonClasses}>Roll Number</TableHead>
          <TableHead className={commonClasses}>Class</TableHead>
          <TableHead className={commonClasses}>Contact</TableHead>
          <TableHead className={commonClasses}>Status</TableHead>
        </>
      );
    case "teachers":
      return (
        <>
          <TableHead className={commonClasses}>Teacher Name</TableHead>
          <TableHead className={commonClasses}>Qualification</TableHead>
          <TableHead className={commonClasses}>Experience</TableHead>
          <TableHead className={commonClasses}>Contact</TableHead>
          <TableHead className={commonClasses}>Status</TableHead>
        </>
      );
    case "parents":
      return (
        <>
          <TableHead className={commonClasses}>Parent Name</TableHead>
          <TableHead className={commonClasses}>Email</TableHead>
          <TableHead className={commonClasses}>Phone</TableHead>
          <TableHead className={commonClasses}>Occupation</TableHead>
          <TableHead className={commonClasses}>Status</TableHead>
        </>
      );
    case "classes":
      return (
        <>
          <TableHead className={commonClasses}>Class Name</TableHead>
          <TableHead className={commonClasses}>Grade / Section</TableHead>
          <TableHead className={`${commonClasses} text-center`}>Students</TableHead>
          <TableHead className={`${commonClasses} text-center`}>Capacity</TableHead>
        </>
      );
    case "fees":
      return (
        <>
          <TableHead className={commonClasses}>Student</TableHead>
          <TableHead className={commonClasses}>Fee Type</TableHead>
          <TableHead className={`${commonClasses} text-right`}>Amount</TableHead>
          <TableHead className={`${commonClasses} text-center`}>Status</TableHead>
          <TableHead className={`${commonClasses} text-right`}>Due Date</TableHead>
        </>
      );
    case "attendance":
      return (
        <>
          <TableHead className={commonClasses}>Student</TableHead>
          <TableHead className={commonClasses}>Class</TableHead>
          <TableHead className={commonClasses}>Date</TableHead>
          <TableHead className={`${commonClasses} text-center`}>Status</TableHead>
        </>
      );
    case "notices":
      return (
        <>
          <TableHead className={commonClasses}>Notice Title</TableHead>
          <TableHead className={commonClasses}>Author</TableHead>
          <TableHead className={commonClasses}>Target Role</TableHead>
          <TableHead className={`${commonClasses} text-center`}>Priority</TableHead>
          <TableHead className={`${commonClasses} text-right`}>Date</TableHead>
        </>
      );
  }
}

export function renderTableCells(activeTab: TabType, item: any) {
  const cellClasses = "py-4 text-sm font-medium";
  
  const renderStatus = (status: string) => {
    const colors = statusColors[status] || statusColors.inactive;
    return (
      <Badge variant="outline" className={`${colors.bg} ${colors.text} border-transparent capitalize font-black text-[9px] px-2 py-0 h-5 flex items-center gap-1 w-fit`}>
        {colors.icon}
        {status}
      </Badge>
    );
  };

  switch (activeTab) {
    case "students": {
      const s = item as Student;
      return (
        <>
          <TableCell className={cellClasses}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center font-black text-xs">
                {s.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100">{s.name}</div>
                <div className="text-[10px] text-muted-foreground font-medium">{s.gender}</div>
              </div>
            </div>
          </TableCell>
          <TableCell className={`${cellClasses} font-mono text-xs font-bold text-muted-foreground`}>{s.rollNumber}</TableCell>
          <TableCell className={cellClasses}>
            <Badge variant="secondary" className="rounded-lg font-bold text-[10px] bg-gray-100 dark:bg-gray-800 border-none">{s.className}</Badge>
          </TableCell>
          <TableCell className={cellClasses}>
            <div className="text-xs font-medium">{s.email}</div>
            <div className="text-[10px] text-muted-foreground">{s.phone}</div>
          </TableCell>
          <TableCell className={cellClasses}>{renderStatus(s.status)}</TableCell>
        </>
      );
    }
    case "teachers": {
      const t = item as Teacher;
      return (
        <>
          <TableCell className={cellClasses}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-black text-xs">
                {t.name.charAt(0)}
              </div>
              <div className="font-bold text-gray-900 dark:text-gray-100">{t.name}</div>
            </div>
          </TableCell>
          <TableCell className={`${cellClasses} text-xs font-bold`}>{t.qualification}</TableCell>
          <TableCell className={`${cellClasses} text-xs text-muted-foreground`}>{t.experience}</TableCell>
          <TableCell className={cellClasses}>
            <div className="text-xs font-medium">{t.email}</div>
            <div className="text-[10px] text-muted-foreground">{t.phone}</div>
          </TableCell>
          <TableCell className={cellClasses}>{renderStatus(t.status)}</TableCell>
        </>
      );
    }
    case "parents": {
      const p = item as Parent;
      return (
        <>
          <TableCell className={cellClasses}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center font-black text-xs">
                {p.name.charAt(0)}
              </div>
              <div className="font-bold text-gray-900 dark:text-gray-100">{p.name}</div>
            </div>
          </TableCell>
          <TableCell className={`${cellClasses} text-xs font-medium`}>{p.email}</TableCell>
          <TableCell className={`${cellClasses} text-xs font-medium`}>{p.phone}</TableCell>
          <TableCell className={`${cellClasses} text-xs font-bold text-muted-foreground`}>{p.occupation}</TableCell>
          <TableCell className={cellClasses}>{renderStatus(p.status)}</TableCell>
        </>
      );
    }
    case "classes": {
      const c = item as Class;
      return (
        <>
          <TableCell className={cellClasses}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center font-black text-xs">
                {c.name.charAt(0)}
              </div>
              <div className="font-bold text-gray-900 dark:text-gray-100">{c.name}</div>
            </div>
          </TableCell>
          <TableCell className={cellClasses}>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-black border-2 border-purple-100 dark:border-purple-900">Grade {c.grade}</Badge>
              <Badge variant="outline" className="text-[10px] font-black">Section {c.section}</Badge>
            </div>
          </TableCell>
          <TableCell className={`${cellClasses} text-center font-black text-purple-600`}>{c.studentCount}</TableCell>
          <TableCell className={`${cellClasses} text-center font-bold text-muted-foreground`}>{c.capacity}</TableCell>
        </>
      );
    }
    case "fees": {
      const f = item as Fee;
      const getFeeColor = (st: string) => {
        if (st === "paid") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
        if (st === "overdue") return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
      };
      return (
        <>
          <TableCell className={cellClasses}>
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              {f.studentName}
            </div>
          </TableCell>
          <TableCell className={`${cellClasses} text-xs font-bold text-muted-foreground uppercase tracking-wider`}>{f.type}</TableCell>
          <TableCell className={`${cellClasses} text-right font-black`}>
            <div className="flex items-center justify-end text-emerald-600">
              <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
              {f.amount.toLocaleString()}
            </div>
          </TableCell>
          <TableCell className={`${cellClasses} text-center`}>
            <Badge variant="outline" className={`${getFeeColor(f.status)} border-none capitalize font-black text-[9px] px-2 py-0 h-5`}>
              {f.status}
            </Badge>
          </TableCell>
          <TableCell className={`${cellClasses} text-right text-xs font-bold text-muted-foreground`}>
            {format(new Date(f.dueDate), "dd MMM yyyy")}
          </TableCell>
        </>
      );
    }
    case "attendance": {
      const a = item as Attendance;
      const getAttColor = (st: string) => {
        if (st === "present") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
        if (st === "absent") return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      };
      return (
        <>
          <TableCell className={cellClasses}>
            <div className="font-bold text-gray-900 dark:text-gray-100">{a.studentName}</div>
          </TableCell>
          <TableCell className={cellClasses}>
            <Badge variant="secondary" className="text-[10px] font-bold border-none">{a.className}</Badge>
          </TableCell>
          <TableCell className={cellClasses}>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(a.date), "dd MMM yyyy")}
            </div>
          </TableCell>
          <TableCell className={`${cellClasses} text-center`}>
            <Badge variant="outline" className={`${getAttColor(a.status)} border-none capitalize font-black text-[9px] px-2 py-0 h-5`}>
              {a.status}
            </Badge>
          </TableCell>
        </>
      );
    }
    case "notices": {
      const n = item as Notice;
      const getPriorityColor = (p: string) => {
        if (p === "high") return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
        if (p === "medium") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      };
      return (
        <>
          <TableCell className={cellClasses}>
            <div className="font-bold text-gray-900 dark:text-gray-100">{n.title}</div>
            <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{n.content}</div>
          </TableCell>
          <TableCell className={`${cellClasses} text-xs font-bold`}>{n.authorName}</TableCell>
          <TableCell className={cellClasses}>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider h-5 bg-gray-50 dark:bg-gray-900/50">{n.targetRole}</Badge>
          </TableCell>
          <TableCell className={`${cellClasses} text-center`}>
            <Badge variant="outline" className={`${getPriorityColor(n.priority)} font-black text-[9px] px-2 py-0 h-5 flex items-center justify-center gap-1 w-fit mx-auto capitalize`}>
              {n.priority === 'high' && <ShieldAlert className="h-3 w-3" />}
              {n.priority}
            </Badge>
          </TableCell>
          <TableCell className={`${cellClasses} text-right text-xs font-bold text-muted-foreground`}>
            {(() => {
              try {
                const date = new Date(n.createdAt);
                if (isNaN(date.getTime())) return "—";
                return format(date, "dd MMM yyyy");
              } catch {
                return "—";
              }
            })()}
          </TableCell>
        </>
      );
    }
  }
}
