import React, { FC, memo, useEffect, useState } from "react";
import styles from "./Calendar.module.css";
import FullCalendar from "@fullcalendar/react";
// FullCalendarで月表示を可能にするプラグイン。
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
// FullCalendarで日付や時間が選択できるようになるプラグイン。
import interactionPlugin from "@fullcalendar/interaction";
//日本語対応のためのインポート
import jaLocale from "@fullcalendar/core/locales/ja"; //追加
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useDashboardStore from "@/store/useDashboardStore";
import { Meeting_row_data, ValidMeeting } from "@/types";
const CalendarMemo: FC = () => {
  //イベントはオブジェクトの配列をPropsとして渡します
  const eventExample = [
    //オブジェクトの中身はこんな感じ
    //satrtとendの日付で日を跨いだ予定を表示できる
    //背景のカラーもこの中で指定できる
    {
      title: "温泉旅行",
      start: new Date(),
      end: new Date().setDate(new Date().getDate() + 5),
      description: "友達と温泉旅行",
      backgroundColor: "green",
      borderColor: "green",
    },
    {
      title: "期末テスト",
      start: new Date().setDate(new Date().getDate() + 5),
      description: "2年最後の期末テスト",
      backgroundColor: "blue",
      borderColor: "blue",
    },
  ];

  //   type Event = {
  //     title: string | null;
  //     start: Date | null;
  //     end?: Date | null; // end が必要なら追加してください
  //   };
  type Event = {
    title: string;
    start: Date;
    end?: Date;
  };

  const [events, setEvents] = useState<Event[]>([]);

  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function fetchMeetings() {
      try {
        // const params = {
        //     // meeting_created_by_user_id: userProfileState?.id,
        // };
        const params = { "meetings.created_by_user_id": userProfileState?.id };
        const { data, error } = await supabase
          .rpc("search_meetings_and_companies_and_contacts", { params })
          .eq("meeting_created_by_user_id", userProfileState?.id);
        // const { data, error } = await supabase
        //   .from("meetings")
        //   .select("*")
        //   .match({ created_by_user_id: userProfileState?.id });
        if (error) {
          console.log("error", error.message);
          alert(error.message);
          throw error;
        }
        console.log("面談データ一覧取得", data);

        // const formattedEvents: Event[] = (data as Meeting_row_data[])
        //   .map((meeting): Event | null => {
        //     if (!meeting.planned_date || !meeting.planned_start_time) return null;
        //     const date = new Date(meeting.planned_date);

        //     const [hours, minutes, seconds] = meeting.planned_start_time.split(":").map(Number);
        //     date.setHours(hours);
        //     date.setMinutes(minutes);
        //     date.setSeconds(seconds);

        //     return {
        //       title: meeting.company_name || "", // null を受け入れないので空文字にする
        //       start: date,
        //       //   end: meeting.end_date, // データベースのカラム名に合わせてください
        //     };
        //   })
        //   .filter((event): event is Event => event !== null && Boolean(event.start)); // null を除外、startがundefinedのものも除外;
        const validMeetings = (data as Meeting_row_data[]).filter(
          (meeting): meeting is ValidMeeting =>
            typeof meeting.planned_date === "string" && typeof meeting.planned_start_time === "string"
        );
        const formattedEvents: Event[] = validMeetings.map((meeting) => {
          const date = new Date(meeting.planned_date);

          const [hours, minutes, seconds] = meeting.planned_start_time.split(":").map(Number);
          date.setHours(hours);
          date.setMinutes(minutes);
          date.setSeconds(seconds);

          return {
            title: meeting.company_name || "",
            start: date,
            // end: new Date(meeting.end_date), // データベースのカラム名に合わせて適切に設定してください
          };
        });

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    }

    fetchMeetings();
  }, []);

  return (
    <>
      <div className={`${styles.calendar_screen}`}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          locale={jaLocale}
          initialView="dayGridMonth"
          events={events || []}
          eventTimeFormat={{
            // ここに時間の表示形式を追加
            hour: "2-digit",
            minute: "2-digit",
            omitZeroMinute: false, // これがキーです！
            meridiem: "short",
          }}
          weekends={true}
          nowIndicator={true}
          headerToolbar={{
            // start: "prevYear,nextYear",
            start: "today prev,next",
            center: "title",
            // end: "today prev,next",
            // end: "dayGridMonth, timeGridWeek",
            // right: "resourceTimelineWook, dayGridMonth, timeGridWeek",
            // right: "dayGridMonth,dayGridWeek",
            right: "dayGridMonth,timeGridWeek",
          }}
          contentHeight={"calc(100vh - 20px - 20px - 56px - 40px)"}

          //   eventContent={(arg: EventContentArg) => EventComponent(arg)}
        />
      </div>
    </>
  );
};

export const Calendar = memo(CalendarMemo);
