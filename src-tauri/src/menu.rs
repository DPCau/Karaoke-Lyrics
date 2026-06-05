use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

/// Create the native application menu.
///
/// On macOS the first Submenu becomes the application menu
/// (with system items like About, Quit etc. in the correct location).
/// On Windows and Linux it renders as a standard menu bar.
pub fn create_app_menu(app: &tauri::App) -> tauri::Result<Menu<tauri::Wry>> {
    let handle = app.handle();

    // -------- App menu (macOS: automatically becomes the application menu) --------
    let app_menu = Submenu::with_items(handle, "Karaoke Lyrics Maker", true, &[
        &PredefinedMenuItem::about(handle, None, None)?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::services(handle, None)?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::hide(handle, None)?,
        &PredefinedMenuItem::hide_others(handle, None)?,
        &PredefinedMenuItem::show_all(handle, None)?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::quit(handle, None)?,
    ])?;

    // -------- File menu --------
    let file_menu = Submenu::with_items(handle, "文件", true, &[
        &MenuItem::with_id(handle, "new_project", "新建项目", true, Some("CmdOrCtrl+N"))?,
        &MenuItem::with_id(handle, "open_project", "打开项目", true, Some("CmdOrCtrl+O"))?,
        &PredefinedMenuItem::separator(handle)?,
        &MenuItem::with_id(handle, "save_project", "保存", true, Some("CmdOrCtrl+S"))?,
        &MenuItem::with_id(handle, "save_as", "另存为", true, Some("CmdOrCtrl+Shift+S"))?,
        &PredefinedMenuItem::separator(handle)?,
        &Submenu::with_items(handle, "导入", true, &[
            &MenuItem::with_id(handle, "import_video", "导入视频", true, None::<&str>)?,
            &MenuItem::with_id(handle, "import_audio", "导入音频", true, None::<&str>)?,
            &MenuItem::with_id(handle, "import_lyrics", "导入歌词", true, None::<&str>)?,
        ])?,
        &Submenu::with_items(handle, "导出", true, &[
            &MenuItem::with_id(handle, "export_video", "导出视频", true, None::<&str>)?,
            &MenuItem::with_id(handle, "export_lrc", "导出LRC", true, None::<&str>)?,
            &MenuItem::with_id(handle, "export_json", "导出JSON", true, None::<&str>)?,
            &MenuItem::with_id(handle, "export_ass", "导出ASS", true, None::<&str>)?,
        ])?,
        &PredefinedMenuItem::separator(handle)?,
        &MenuItem::with_id(handle, "settings", "设置", true, Some("CmdOrCtrl+,"))?,
    ])?;

    // -------- Edit menu --------
    let edit_menu = Submenu::with_items(handle, "编辑", true, &[
        &PredefinedMenuItem::undo(handle, None)?,
        &PredefinedMenuItem::redo(handle, None)?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::cut(handle, None)?,
        &PredefinedMenuItem::copy(handle, None)?,
        &PredefinedMenuItem::paste(handle, None)?,
        &PredefinedMenuItem::select_all(handle, None)?,
    ])?;

    // -------- View menu --------
    let view_menu = Submenu::with_items(handle, "视图", true, &[
        &MenuItem::with_id(handle, "fullscreen", "全屏", true, Some("F11"))?,
    ])?;

    // -------- Timing menu --------
    let timing_menu = Submenu::with_items(handle, "打轴", true, &[
        &MenuItem::with_id(handle, "start_timing", "开始打轴", true, Some("F2"))?,
        &MenuItem::with_id(handle, "stop_timing", "停止打轴", true, None::<&str>)?,
        &PredefinedMenuItem::separator(handle)?,
        &MenuItem::with_id(handle, "timing_realtime", "实时打轴", true, None::<&str>)?,
        &MenuItem::with_id(handle, "timing_tap", "Tap打轴", true, None::<&str>)?,
        &MenuItem::with_id(handle, "timing_sentence", "句级打轴", true, None::<&str>)?,
    ])?;

    // -------- Help menu --------
    let help_menu = Submenu::with_items(handle, "帮助", true, &[
        &MenuItem::with_id(handle, "shortcuts", "快捷键", true, Some("?"))?,
        &PredefinedMenuItem::separator(handle)?,
        &PredefinedMenuItem::about(handle, Some("关于"), None)?,
    ])?;

    // -------- Assemble menu bar --------
    let menu = Menu::with_items(handle, &[
        &app_menu,
        &file_menu,
        &edit_menu,
        &view_menu,
        &timing_menu,
        &help_menu,
    ])?;

    Ok(menu)
}
