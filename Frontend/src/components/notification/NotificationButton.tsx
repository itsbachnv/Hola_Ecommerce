import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from "lucide-react";
import { createNotificationConnection } from "@/services/notificationHub";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { TokenUtils } from "@/utils/tokenUtils";

type NotificationDto = {
  notificationId: number;
  title: string;
  type: string;
  message: string;
  targetUrl?: string;
  mappingUrl?: string;
  relatedObjectId?: number;
  createdAt: string;
  isRead: boolean;
};

const typeToRouteMapping: { [key: string]: string } = {
  "transaction": "/financial-transactions",
  "appointment": "/appointments",
  "patient": "/patients",
  "promotion": "/promotions",
  "promotions": "/promotions",
  "invoice": "/invoices",
  "schedule": "/schedules",
  "procedure": "/procedures",
  "task_assigned": "/assistant/assigned-tasks",
  "warranty-card": "/assistant/warranty-cards",
  "Tiến trình điều trị": "/patient/treatment-records",
  "Xem hồ sơ": "/patient/treatment-records",
  "Xoá hồ sơ": "/patient/treatment-records",
  "Xem chi tiết": "/patient/orthodontic-treatment-plans",
  "Chỉ dẫn điều trị": "/prescription-templates",
  "Đăng ký lịch làm việc": "/schedules",
  "Info": "/",
  "Error": "/",
  "Reminder": "/",
  "Alert": "/"
};

function mapTypeToRoute(type: string): string {
  if (typeToRouteMapping[type]) return typeToRouteMapping[type];
  const lower = type.toLowerCase().trim();

  if (lower.includes("transaction") || lower.includes("thu") || lower.includes("chi"))
    return "/financial-transactions";
  if (lower.includes("appointment") || lower.includes("lịch hẹn") || lower.includes("hẹn"))
    return "/appointments";
  if (lower.includes("patient") || lower.includes("bệnh nhân"))
    return "/patients";
  if (lower.includes("promotion") || lower.includes("khuyến mãi"))
    return "/promotions";
  if (lower.includes("invoice") || lower.includes("hóa đơn") || lower.includes("thanh toán"))
    return "/invoices";
  if (lower.includes("schedule") || lower.includes("lịch làm việc"))
    return "/schedules";
  if (lower.includes("điều trị") || lower.includes("treatment"))
    return "/patient/treatment-records";
  if (lower.includes("đơn thuốc") || lower.includes("prescription"))
    return "/prescription-templates";
  if (lower.includes("nhiệm vụ") || lower.includes("task"))
    return "/assistant/assigned-tasks";
  if (lower.includes("bảo hành") || lower.includes("warranty"))
    return "/assistant/warranty-cards";

  return "/";
}

export function NotificationButton() {
  const [showList, setShowList] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowList(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showList]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const userId = TokenUtils.getUserIdFromToken(token);
    if (!token || !userId) return; // Chỉ mở kết nối nếu đã login

    const connection = createNotificationConnection(token);
    connection.start().catch(console.error);

    axios.get<NotificationDto[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      },
    }).then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);

      axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/unread-count/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        },
      }).then((res) => {
        if (res.data?.unreadCount > 0) setHasUnread(true);
      });
    }).catch(console.error);

    connection.on("ReceiveNotification", (notification: NotificationDto) => {
      setNotifications((prev) => [notification, ...prev]);
      setHasUnread(true);
      audioRef.current?.play().catch(err => console.warn("Không thể phát âm thanh:", err));
    });

    return () => {
      connection.stop();
    };
  }, [showList]);

  const handleClick = () => {
    setShowList((prev) => !prev);
    setHasUnread(false);
  };

  const handleNotificationClick = async (notification: NotificationDto) => {
    const token = localStorage.getItem("token") || "";
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/mark-as-read/${notification.notificationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          },
        }
      );
    } catch (err) {
      console.warn("Không thể đánh dấu đã đọc:", err);
    }

    let route: string;
    if (notification.mappingUrl && notification.mappingUrl.trim() !== "") {
      route = notification.mappingUrl.startsWith('/')
        ? notification.mappingUrl
        : `/${notification.mappingUrl}`;
    } else if (notification.type && notification.mappingUrl?.includes('/')) {
      route = `/${notification.mappingUrl}`;
    } else if (notification.relatedObjectId && notification.relatedObjectId > 0) {
      const baseRoute = mapTypeToRoute(notification.type);
      route = `${baseRoute}/${notification.relatedObjectId}`;
    } else {
      route = mapTypeToRoute(notification.type);
    }

    setShowList(false);
    router.push(route);

    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
      )
    );

    const unreadLeft = notifications.filter((n) => !n.isRead && n.notificationId !== notification.notificationId);
    setHasUnread(unreadLeft.length > 0);
  };

    const handleMarkAllAsRead = async (): Promise<void> => {
    const token = localStorage.getItem("token") || "";
    const userId = TokenUtils.getUserIdFromToken(token);
    if (!token || !userId) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/mark-all-as-read/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          },
        }
      );
      setNotifications((prev: NotificationDto[]) => prev.map((n: NotificationDto) => ({ ...n, isRead: true })));
      setHasUnread(false);
    } catch {
      toast.error("Không thể đánh dấu tất cả đã đọc");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <audio ref={audioRef} src="/sound/inflicted-601.ogg" preload="auto" />
      <button
        onClick={handleClick}
        className="relative grid h-10 w-10 place-items-center rounded-xl ring-1 ring-black/10 hover:bg-black/5 bg-white dark:bg-gray-900"
        title="Thông báo"
      >
        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-ping">
            <span className="absolute w-4 h-4 bg-red-500 rounded-full opacity-75"></span>
            <span className="relative text-[10px] text-white font-bold z-10">
              {notifications.filter(n => !n.isRead).length > 9 ? '9+' : notifications.filter(n => !n.isRead).length}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {showList && (
          <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
  className="absolute right-0 mt-3 w-96 rounded-2xl shadow-2xl z-50 overflow-hidden
             bg-gradient-to-br from-white via-blue-50 to-indigo-50 
             dark:from-neutral-900 dark:via-neutral-800 dark:to-blue-950
             border border-blue-200/50 dark:border-blue-900/50"
>
  {/* Header */}
  <div className="px-6 py-4 border-b border-blue-100/50 dark:border-blue-900/50 
                  flex items-center justify-between 
                  bg-gradient-to-r from-blue-500/10 to-indigo-500/10
                  dark:from-blue-900/30 dark:to-indigo-900/30">
    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base flex items-center gap-2">
      🔔 Thông báo
    </h3>
    <button
      onClick={handleMarkAllAsRead}
      className="text-xs px-3 py-1 rounded-full 
                 bg-gradient-to-r from-blue-500 to-indigo-500 
                 text-white shadow-sm
                 hover:scale-105 hover:shadow-md transition-all"
      disabled={notifications.every(n => n.isRead)}
    >
      Đánh dấu tất cả
    </button>
  </div>

  {/* Danh sách */}
  <div className="max-h-96 overflow-y-auto custom-scrollbar 
                  bg-white/80 dark:bg-neutral-900/80 
                  backdrop-blur-sm">
    {notifications.length === 0 ? (
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full 
                        bg-gradient-to-tr from-blue-100 to-indigo-200 
                        dark:from-blue-900 dark:to-indigo-950
                        flex items-center justify-center mx-auto mb-4">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-500 dark:text-indigo-400"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Không có thông báo mới</p>
      </div>
    ) : (
      notifications.map((n) => (
        <div
          key={n.notificationId}
          onClick={() => handleNotificationClick(n)}
          className={`p-4 border-b border-gray-100 dark:border-neutral-800 cursor-pointer 
                      transition-all group 
                      ${!n.isRead
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-900 border-l-4 border-indigo-500'
                        : 'bg-white/70 dark:bg-neutral-900/70'}
                      hover:scale-[1.01] hover:shadow-sm`}
        >
          <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-sm">
            {n.title}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 line-clamp-2">
            {n.message}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 italic">
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      ))
    )}
  </div>
</motion.div>

        )}
      </AnimatePresence>
    </div>
  );
}