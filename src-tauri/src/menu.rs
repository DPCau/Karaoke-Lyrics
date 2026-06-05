use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

// ---------------------------------------------------------------------------
// Menu texts — i18n for native menu bar (macOS / Windows / Linux)
// Maps to the keys in src/i18n/locales/*.json so the menu text matches the
// custom MenuBar.tsx component.
// ---------------------------------------------------------------------------
#[derive(Clone)]
pub struct MenuTexts {
    // App menu (macOS‑only, title is the app name)
    pub about: String,
    pub services: String,
    pub hide: String,
    pub hide_others: String,
    pub show_all: String,
    pub quit: String,
    // File
    pub file: String,
    pub new_project: String,
    pub open_project: String,
    pub save: String,
    pub save_as: String,
    pub import_: String,
    pub import_video: String,
    pub import_audio: String,
    pub import_lyrics: String,
    pub export_: String,
    pub export_video: String,
    pub export_lrc: String,
    pub export_json: String,
    pub export_ass: String,
    pub recent_projects: String,
    pub settings: String,
    // Edit
    pub edit: String,
    pub undo: String,
    pub redo: String,
    pub cut: String,
    pub copy: String,
    pub paste: String,
    pub select_all: String,
    pub find_replace: String,
    // View
    pub view: String,
    pub panels: String,
    pub zoom: String,
    pub fullscreen: String,
    // Timing
    pub timing: String,
    pub start_timing: String,
    pub stop_timing: String,
    pub timing_mode: String,
    pub realtime: String,
    pub tap: String,
    pub sentence: String,
    // Style
    pub style: String,
    pub style_presets: String,
    // Tools
    pub tools: String,
    pub annotate: String,
    pub batch: String,
    // Help
    pub help: String,
    pub shortcuts: String,
}

impl MenuTexts {
    /// Return menu texts for the given language code.
    /// Codes match those used in the front‑end i18n system:
    /// `zh-CN` (default), `zh-TW`, `ja-JP`, `en`.
    pub fn for_locale(lang: &str) -> Self {
        match lang {
            "en" => Self::english(),
            "zh-TW" => Self::chinese_traditional(),
            "ja-JP" => Self::japanese(),
            _ => Self::chinese_simplified(), // zh‑CN default
        }
    }

    fn english() -> Self {
        Self {
            about: "About Karaoke Lyrics Maker".into(),
            services: "Services".into(),
            hide: "Hide Karaoke Lyrics Maker".into(),
            hide_others: "Hide Others".into(),
            show_all: "Show All".into(),
            quit: "Quit Karaoke Lyrics Maker".into(),
            file: "File".into(),
            new_project: "New Project".into(),
            open_project: "Open Project".into(),
            save: "Save".into(),
            save_as: "Save As".into(),
            import_: "Import".into(),
            import_video: "Import Video".into(),
            import_audio: "Import Audio".into(),
            import_lyrics: "Import Lyrics".into(),
            export_: "Export".into(),
            export_video: "Export Video".into(),
            export_lrc: "Export LRC".into(),
            export_json: "Export JSON".into(),
            export_ass: "Export ASS".into(),
            recent_projects: "Recent Projects".into(),
            settings: "Settings".into(),
            edit: "Edit".into(),
            undo: "Undo".into(),
            redo: "Redo".into(),
            cut: "Cut".into(),
            copy: "Copy".into(),
            paste: "Paste".into(),
            select_all: "Select All".into(),
            find_replace: "Find & Replace".into(),
            view: "View".into(),
            panels: "Panels".into(),
            zoom: "Zoom".into(),
            fullscreen: "Fullscreen".into(),
            timing: "Timing".into(),
            start_timing: "Start Timing".into(),
            stop_timing: "Stop Timing".into(),
            timing_mode: "Timing Mode".into(),
            realtime: "Real-time".into(),
            tap: "Tap Timing".into(),
            sentence: "Sentence Timing".into(),
            style: "Style".into(),
            style_presets: "Style Presets".into(),
            tools: "Tools".into(),
            annotate: "Auto Annotate".into(),
            batch: "Batch Operations".into(),
            help: "Help".into(),
            shortcuts: "Shortcuts".into(),
        }
    }

    fn chinese_simplified() -> Self {
        Self {
            about: "关于".into(),
            services: "服务".into(),
            hide: "隐藏".into(),
            hide_others: "隐藏其他".into(),
            show_all: "显示全部".into(),
            quit: "退出".into(),
            file: "文件".into(),
            new_project: "新建项目".into(),
            open_project: "打开项目".into(),
            save: "保存".into(),
            save_as: "另存为".into(),
            import_: "导入".into(),
            import_video: "导入视频".into(),
            import_audio: "导入音频".into(),
            import_lyrics: "导入歌词".into(),
            export_: "导出".into(),
            export_video: "导出视频".into(),
            export_lrc: "导出LRC".into(),
            export_json: "导出JSON".into(),
            export_ass: "导出ASS".into(),
            recent_projects: "最近项目".into(),
            settings: "设置".into(),
            edit: "编辑".into(),
            undo: "撤销".into(),
            redo: "重做".into(),
            cut: "剪切".into(),
            copy: "复制".into(),
            paste: "粘贴".into(),
            select_all: "全选".into(),
            find_replace: "查找替换".into(),
            view: "视图".into(),
            panels: "面板".into(),
            zoom: "缩放".into(),
            fullscreen: "全屏".into(),
            timing: "打轴".into(),
            start_timing: "开始打轴".into(),
            stop_timing: "停止打轴".into(),
            timing_mode: "打轴模式".into(),
            realtime: "实时打轴".into(),
            tap: "Tap打轴".into(),
            sentence: "句级打轴".into(),
            style: "样式".into(),
            style_presets: "样式预设".into(),
            tools: "工具".into(),
            annotate: "自动注音".into(),
            batch: "批量操作".into(),
            help: "帮助".into(),
            shortcuts: "快捷键".into(),
        }
    }

    fn chinese_traditional() -> Self {
        Self {
            about: "關於".into(),
            services: "服務".into(),
            hide: "隱藏".into(),
            hide_others: "隱藏其他".into(),
            show_all: "顯示全部".into(),
            quit: "結束".into(),
            file: "檔案".into(),
            new_project: "開新專案".into(),
            open_project: "開啟專案".into(),
            save: "儲存".into(),
            save_as: "另存新檔".into(),
            import_: "匯入".into(),
            import_video: "匯入影片".into(),
            import_audio: "匯入音訊".into(),
            import_lyrics: "匯入歌詞".into(),
            export_: "匯出".into(),
            export_video: "匯出影片".into(),
            export_lrc: "匯出LRC".into(),
            export_json: "匯出JSON".into(),
            export_ass: "匯出ASS".into(),
            recent_projects: "最近專案".into(),
            settings: "設定".into(),
            edit: "編輯".into(),
            undo: "復原".into(),
            redo: "重做".into(),
            cut: "剪下".into(),
            copy: "複製".into(),
            paste: "貼上".into(),
            select_all: "全選".into(),
            find_replace: "尋找取代".into(),
            view: "檢視".into(),
            panels: "面板".into(),
            zoom: "縮放".into(),
            fullscreen: "全螢幕".into(),
            timing: "打軸".into(),
            start_timing: "開始打軸".into(),
            stop_timing: "停止打軸".into(),
            timing_mode: "打軸模式".into(),
            realtime: "即時打軸".into(),
            tap: "Tap打軸".into(),
            sentence: "句子打軸".into(),
            style: "樣式".into(),
            style_presets: "樣式預設".into(),
            tools: "工具".into(),
            annotate: "自動注音".into(),
            batch: "批次操作".into(),
            help: "說明".into(),
            shortcuts: "快速鍵".into(),
        }
    }

    fn japanese() -> Self {
        Self {
            about: "Karaoke Lyrics Makerについて".into(),
            services: "サービス".into(),
            hide: "非表示".into(),
            hide_others: "他を非表示".into(),
            show_all: "すべて表示".into(),
            quit: "終了".into(),
            file: "ファイル".into(),
            new_project: "新規プロジェクト".into(),
            open_project: "プロジェクトを開く".into(),
            save: "保存".into(),
            save_as: "名前を付けて保存".into(),
            import_: "インポート".into(),
            import_video: "動画をインポート".into(),
            import_audio: "音声をインポート".into(),
            import_lyrics: "歌詞をインポート".into(),
            export_: "エクスポート".into(),
            export_video: "動画をエクスポート".into(),
            export_lrc: "LRCをエクスポート".into(),
            export_json: "JSONをエクスポート".into(),
            export_ass: "ASSをエクスポート".into(),
            recent_projects: "最近のプロジェクト".into(),
            settings: "設定".into(),
            edit: "編集".into(),
            undo: "元に戻す".into(),
            redo: "やり直し".into(),
            cut: "カット".into(),
            copy: "コピー".into(),
            paste: "ペースト".into(),
            select_all: "すべて選択".into(),
            find_replace: "検索と置換".into(),
            view: "表示".into(),
            panels: "パネル".into(),
            zoom: "ズーム".into(),
            fullscreen: "全画面表示".into(),
            timing: "タイミング".into(),
            start_timing: "タイミング開始".into(),
            stop_timing: "タイミング停止".into(),
            timing_mode: "タイミングモード".into(),
            realtime: "リアルタイム".into(),
            tap: "タップ入力".into(),
            sentence: "文単位".into(),
            style: "スタイル".into(),
            style_presets: "スタイルプリセット".into(),
            tools: "ツール".into(),
            annotate: "自動ふりがな".into(),
            batch: "一括操作".into(),
            help: "ヘルプ".into(),
            shortcuts: "ショートカット".into(),
        }
    }
}

// ---------------------------------------------------------------------------
// App name (used as the macOS application menu title)
// ---------------------------------------------------------------------------
const APP_NAME: &str = "Karaoke Lyrics Maker";

// ---------------------------------------------------------------------------
// Menu builder
// ---------------------------------------------------------------------------

/// Create the complete native application menu.
///
/// Accepts an `AppHandle` and a language code so the same function can be
/// called both at startup (from `setup`) and at runtime when the user changes
/// the UI language (via the `update_menu_language` IPC command).
///
/// On macOS the first Submenu becomes the application menu (with system items
/// like About, Quit etc. in the correct location).  On Windows and Linux it
/// renders as a standard menu bar.
pub fn create_app_menu(
    handle: &tauri::AppHandle,
    lang: &str,
) -> tauri::Result<Menu<tauri::Wry>> {
    let t = MenuTexts::for_locale(lang);

    // -------- App menu (macOS‑only: automatically becomes the application menu) --------
    let app_menu = Submenu::with_items(handle, APP_NAME, true, &[
        &PredefinedMenuItem::about(handle, Some(&t.about), None)?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::services(handle, Some(&t.services))?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::hide(handle, Some(&t.hide))?,
        &PredefinedMenuItem::hide_others(handle, Some(&t.hide_others))?,
        &PredefinedMenuItem::show_all(handle, Some(&t.show_all))?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::quit(handle, Some(&t.quit))?,
    ])?;

    // -------- File menu --------
    let file_menu = Submenu::with_items(handle, &t.file, true, &[
        &MenuItem::with_id(handle, "new_project", &t.new_project, true, Some("CmdOrCtrl+N"))?,
        &MenuItem::with_id(handle, "open_project", &t.open_project, true, Some("CmdOrCtrl+O"))?,
        &PredefinedMenuItem::separator(handle)?,
        &MenuItem::with_id(handle, "save_project", &t.save, true, Some("CmdOrCtrl+S"))?,
        &MenuItem::with_id(handle, "save_as", &t.save_as, true, Some("CmdOrCtrl+Shift+S"))?,
        &PredefinedMenuItem::separator(handle)?,
        &Submenu::with_items(handle, &t.import_, true, &[
            &MenuItem::with_id(handle, "import_video", &t.import_video, true, None::<&str>)?,
            &MenuItem::with_id(handle, "import_audio", &t.import_audio, true, None::<&str>)?,
            &MenuItem::with_id(handle, "import_lyrics", &t.import_lyrics, true, None::<&str>)?,
        ])?,
        &Submenu::with_items(handle, &t.export_, true, &[
            &MenuItem::with_id(handle, "export_video", &t.export_video, true, None::<&str>)?,
            &MenuItem::with_id(handle, "export_lrc", &t.export_lrc, true, None::<&str>)?,
            &MenuItem::with_id(handle, "export_json", &t.export_json, true, None::<&str>)?,
            &MenuItem::with_id(handle, "export_ass", &t.export_ass, true, None::<&str>)?,
        ])?,
        &MenuItem::with_id(handle, "recent_projects", &t.recent_projects, false, None::<&str>)?,
        &PredefinedMenuItem::separator(handle)?,
        &MenuItem::with_id(handle, "settings", &t.settings, true, Some("CmdOrCtrl+,"))?,
    ])?;

    // -------- Edit menu --------
    let edit_menu = Submenu::with_items(handle, &t.edit, true, &[
        &PredefinedMenuItem::undo(handle, Some(&t.undo))?,
        &PredefinedMenuItem::redo(handle, Some(&t.redo))?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::cut(handle, Some(&t.cut))?,
        &PredefinedMenuItem::copy(handle, Some(&t.copy))?,
        &PredefinedMenuItem::paste(handle, Some(&t.paste))?,
        &PredefinedMenuItem::select_all(handle, Some(&t.select_all))?,
        &PredefinedMenuItem::separator(handle)?,
        &MenuItem::with_id(handle, "find_replace", &t.find_replace, true, Some("CmdOrCtrl+F"))?,
    ])?;

    // -------- View menu --------
    let view_menu = Submenu::with_items(handle, &t.view, true, &[
        &MenuItem::with_id(handle, "panels", &t.panels, true, None::<&str>)?,
        &MenuItem::with_id(handle, "zoom", &t.zoom, true, None::<&str>)?,
        &PredefinedMenuItem::separator(handle)?,
        &MenuItem::with_id(handle, "fullscreen", &t.fullscreen, true, Some("F11"))?,
    ])?;

    // -------- Timing menu --------
    let timing_menu = Submenu::with_items(handle, &t.timing, true, &[
        &MenuItem::with_id(handle, "start_timing", &t.start_timing, true, Some("F2"))?,
        &MenuItem::with_id(handle, "stop_timing", &t.stop_timing, true, None::<&str>)?,
        &PredefinedMenuItem::separator(handle)?,
        &Submenu::with_items(handle, &t.timing_mode, true, &[
            &MenuItem::with_id(handle, "timing_realtime", &t.realtime, true, None::<&str>)?,
            &MenuItem::with_id(handle, "timing_tap", &t.tap, true, None::<&str>)?,
            &MenuItem::with_id(handle, "timing_sentence", &t.sentence, true, None::<&str>)?,
        ])?,
    ])?;

    // -------- Style menu --------
    let style_menu = Submenu::with_items(handle, &t.style, true, &[
        &MenuItem::with_id(handle, "style_presets", &t.style_presets, true, None::<&str>)?,
    ])?;

    // -------- Tools menu --------
    let tools_menu = Submenu::with_items(handle, &t.tools, true, &[
        &MenuItem::with_id(handle, "tools_annotate", &t.annotate, true, None::<&str>)?,
        &MenuItem::with_id(handle, "tools_batch", &t.batch, true, None::<&str>)?,
    ])?;

    // -------- Help menu --------
    let help_menu = Submenu::with_items(handle, &t.help, true, &[
        &MenuItem::with_id(handle, "shortcuts", &t.shortcuts, true, Some("?"))?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::about(handle, Some(&t.about), None)?,
    ])?;

    // -------- Assemble menu bar (order matches MenuBar.tsx) --------
    let menu = Menu::with_items(handle, &[
        &app_menu,   // macOS‑only — ignored on Windows/Linux
        &file_menu,
        &edit_menu,
        &view_menu,
        &timing_menu,
        &style_menu,
        &tools_menu,
        &help_menu,
    ])?;

    Ok(menu)
}
