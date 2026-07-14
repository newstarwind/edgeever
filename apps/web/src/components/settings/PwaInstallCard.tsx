import { Monitor, Smartphone, CheckCircle2, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePwaInstall } from "../PwaInstallContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const PwaInstallCard = () => {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, isIOS, install } = usePwaInstall();

  if (isInstalled) {
    return null;
  }

  return (
    <Card className="w-full min-w-0 overflow-hidden shadow-none lg:hidden">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Monitor className="h-4 w-4 text-emerald-700" />
          {t("pwa.settingsCard.title") || "客户端与多端使用"}
        </CardTitle>
        <CardDescription className="mt-1 text-xs leading-4">
          {t("pwa.settingsCard.description") || "将 EdgeEver 安装为独立的桌面应用或手机 App，获得更沉浸的无边框体验并支持离线访问。"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 pt-0">
        {isInstalled ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/30 px-3.5 py-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
            <div>
              <span className="font-semibold">{t("pwa.settingsCard.installedTitle") || "已成功作为应用安装"}</span>
              <p className="mt-0.5 text-emerald-600/90 leading-relaxed">
                {t("pwa.settingsCard.installedDesc") || "您正在以独立客户端模式运行 EdgeEver，享有更纯净的编辑视窗与优异的响应速度。"}
              </p>
            </div>
          </div>
        ) : isInstallable ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("pwa.settingsCard.installableDesc") || "检测到您的浏览器支持一键安装。点击下方按钮即可将 EdgeEver 添加到您的桌面或应用程序列表。"}
            </p>
            <div>
              <Button
                size="md"
                variant="outline"
                className="border-emerald-200 bg-emerald-50/20 text-emerald-800 hover:bg-emerald-50/50 hover:text-emerald-950 font-semibold"
                type="button"
                onClick={install}
              >
                <Download className="h-4 w-4" />
                {t("pwa.settingsCard.installBtn") || "安装 EdgeEver 客户端"}
              </Button>
            </div>
          </div>
        ) : isIOS ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
              <Smartphone className="h-4 w-4 text-emerald-600" />
              {t("pwa.settingsCard.iosGuideTitle") || "iOS (Safari) 安装指南"}
            </div>
            <p className="mb-3 text-slate-500 leading-relaxed">
              {t("pwa.settingsCard.iosGuideDesc") || "iOS 系统的安全机制不允许在网页内一键安装，您可以通过以下方式将其添加到您的桌面："}
            </p>
            <div className="flex flex-col gap-2 bg-white rounded-md border border-slate-200/60 p-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-50 border border-slate-200 text-slate-500 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </span>
                <span>1. {t("pwa.iosPrompt.step1") || "点击 Safari 浏览器底部的分享按钮"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-50 border border-slate-200 text-slate-500 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </span>
                <span>2. {t("pwa.iosPrompt.step2") || "在菜单中找到并选择「添加到主屏幕」"}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-100 bg-slate-50/30 p-3 text-xs text-slate-500 leading-relaxed">
            <p>
              {t("pwa.settingsCard.unsupportedDesc") || "如何安装为客户端？您可以使用 Chrome、Safari、Edge 等主流浏览器打开本站："}
            </p>
            <ul className="mt-1.5 list-disc pl-4 space-y-1">
              <li>{t("pwa.settingsCard.unsupportedStep1") || "在电脑端：点击浏览器地址栏右侧的「安装」图标（通常是一个屏幕加向下箭头）。"}</li>
              <li>{t("pwa.settingsCard.unsupportedStep2") || "在手机端：在浏览器菜单中选择「添加到主屏幕」或「安装应用」。"}</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
