import tkinter as tk
from tkinter import ttk
import time
import threading
from datetime import datetime, timedelta

class ClockApp:
    def __init__(self, root):
        self.root = root
        self.root.title("多功能时钟")
        self.root.geometry("400x300")
        
        # 当前时间变量
        self.current_time = tk.StringVar()
        
        # 正计时变量
        self.stopwatch_running = False
        self.stopwatch_start_time = None
        self.stopwatch_elapsed = timedelta()
        self.stopwatch_time = tk.StringVar()
        self.stopwatch_time.set("00:00:00")
        
        # 倒计时变量
        self.countdown_running = False
        self.countdown_end_time = None
        self.countdown_time = tk.StringVar()
        self.countdown_time.set("00:00:00")
        self.countdown_total_seconds = 0
        
        self.create_widgets()
        self.update_time()
    
    def create_widgets(self):
        # 当前时间显示
        time_frame = ttk.LabelFrame(self.root, text="当前时间", padding=(10, 5))
        time_frame.pack(pady=10, padx=10, fill="x")
        
        time_label = ttk.Label(time_frame, textvariable=self.current_time, font=("Arial", 16))
        time_label.pack()
        
        # 正计时功能
        stopwatch_frame = ttk.LabelFrame(self.root, text="正计时", padding=(10, 5))
        stopwatch_frame.pack(pady=10, padx=10, fill="x")
        
        stopwatch_label = ttk.Label(stopwatch_frame, textvariable=self.stopwatch_time, font=("Arial", 14))
        stopwatch_label.pack(side=tk.LEFT)
        
        self.stopwatch_start_btn = ttk.Button(stopwatch_frame, text="开始", command=self.start_stopwatch)
        self.stopwatch_start_btn.pack(side=tk.LEFT, padx=(10, 5))
        
        self.stopwatch_stop_btn = ttk.Button(stopwatch_frame, text="停止", command=self.stop_stopwatch, state="disabled")
        self.stopwatch_stop_btn.pack(side=tk.LEFT, padx=5)
        
        self.stopwatch_reset_btn = ttk.Button(stopwatch_frame, text="重置", command=self.reset_stopwatch)
        self.stopwatch_reset_btn.pack(side=tk.LEFT, padx=(5, 10))
        
        # 倒计时功能
        countdown_frame = ttk.LabelFrame(self.root, text="倒计时", padding=(10, 5))
        countdown_frame.pack(pady=10, padx=10, fill="x")
        
        countdown_label = ttk.Label(countdown_frame, textvariable=self.countdown_time, font=("Arial", 14))
        countdown_label.pack(side=tk.LEFT)
        
        # 倒计时设置
        time_setting_frame = ttk.Frame(countdown_frame)
        time_setting_frame.pack(side=tk.LEFT, padx=(10, 0))
        
        ttk.Label(time_setting_frame, text="时:").pack(side=tk.LEFT)
        self.hour_entry = ttk.Entry(time_setting_frame, width=3)
        self.hour_entry.pack(side=tk.LEFT)
        self.hour_entry.insert(0, "0")
        
        ttk.Label(time_setting_frame, text="分:").pack(side=tk.LEFT, padx=(5, 0))
        self.minute_entry = ttk.Entry(time_setting_frame, width=3)
        self.minute_entry.pack(side=tk.LEFT)
        self.minute_entry.insert(0, "0")
        
        ttk.Label(time_setting_frame, text="秒:").pack(side=tk.LEFT, padx=(5, 0))
        self.second_entry = ttk.Entry(time_setting_frame, width=3)
        self.second_entry.pack(side=tk.LEFT)
        self.second_entry.insert(0, "0")
        
        self.countdown_start_btn = ttk.Button(countdown_frame, text="开始", command=self.start_countdown)
        self.countdown_start_btn.pack(side=tk.LEFT, padx=(10, 5))
        
        self.countdown_stop_btn = ttk.Button(countdown_frame, text="停止", command=self.stop_countdown, state="disabled")
        self.countdown_stop_btn.pack(side=tk.LEFT, padx=5)
        
        self.countdown_reset_btn = ttk.Button(countdown_frame, text="重置", command=self.reset_countdown)
        self.countdown_reset_btn.pack(side=tk.LEFT, padx=(5, 10))
    
    def update_time(self):
        # 更新当前时间
        current = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.current_time.set(current)
        
        # 每秒更新一次
        self.root.after(1000, self.update_time)
    
    def start_stopwatch(self):
        if not self.stopwatch_running:
            self.stopwatch_running = True
            self.stopwatch_start_time = datetime.now() - self.stopwatch_elapsed
            self.stopwatch_start_btn.config(state="disabled")
            self.stopwatch_stop_btn.config(state="normal")
            self.update_stopwatch()
    
    def stop_stopwatch(self):
        if self.stopwatch_running:
            self.stopwatch_running = False
            self.stopwatch_elapsed = datetime.now() - self.stopwatch_start_time
            self.stopwatch_start_btn.config(state="normal")
            self.stopwatch_stop_btn.config(state="disabled")
    
    def reset_stopwatch(self):
        self.stopwatch_running = False
        self.stopwatch_elapsed = timedelta()
        self.stopwatch_time.set("00:00:00")
        self.stopwatch_start_btn.config(state="normal")
        self.stopwatch_stop_btn.config(state="disabled")
    
    def update_stopwatch(self):
        if self.stopwatch_running:
            elapsed = datetime.now() - self.stopwatch_start_time
            hours, remainder = divmod(int(elapsed.total_seconds()), 3600)
            minutes, seconds = divmod(remainder, 60)
            time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            self.stopwatch_time.set(time_str)
            self.root.after(100, self.update_stopwatch)  # 每100毫秒更新一次以提高精度
    
    def start_countdown(self):
        if not self.countdown_running:
            try:
                hours = int(self.hour_entry.get() or 0)
                minutes = int(self.minute_entry.get() or 0)
                seconds = int(self.second_entry.get() or 0)
                
                total_seconds = hours * 3600 + minutes * 60 + seconds
                
                if total_seconds > 0:
                    self.countdown_total_seconds = total_seconds
                    self.countdown_end_time = datetime.now() + timedelta(seconds=total_seconds)
                    self.countdown_running = True
                    self.countdown_start_btn.config(state="disabled")
                    self.countdown_stop_btn.config(state="normal")
                    self.update_countdown()
                else:
                    self.countdown_time.set("请输入有效时间")
            except ValueError:
                self.countdown_time.set("请输入有效数字")
    
    def stop_countdown(self):
        if self.countdown_running:
            self.countdown_running = False
            self.countdown_start_btn.config(state="normal")
            self.countdown_stop_btn.config(state="disabled")
    
    def reset_countdown(self):
        self.countdown_running = False
        self.countdown_time.set("00:00:00")
        self.countdown_start_btn.config(state="normal")
        self.countdown_stop_btn.config(state="disabled")
    
    def update_countdown(self):
        if self.countdown_running:
            remaining = self.countdown_end_time - datetime.now()
            if remaining.total_seconds() <= 0:
                self.countdown_time.set("时间到!")
                self.countdown_running = False
                self.countdown_start_btn.config(state="normal")
                self.countdown_stop_btn.config(state="disabled")
                # 可以在这里添加提醒功能，如弹窗或声音
            else:
                hours, remainder = divmod(int(remaining.total_seconds()), 3600)
                minutes, seconds = divmod(remainder, 60)
                time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
                self.countdown_time.set(time_str)
                self.root.after(100, self.update_countdown)  # 每100毫秒更新一次

def main():
    root = tk.Tk()
    app = ClockApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()