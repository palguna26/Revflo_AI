'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { WorkspaceTab } from './workspace-tab';
import { ProfileTab } from './profile-tab';
import { IntegrationsTab } from './integrations-tab';
import { BillingTab } from './billing-tab';
import { ApiKeysTab } from './api-keys-tab';

const TABS = [
    { id: 'profile', label: 'Profile' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'billing', label: 'Billing' },
    { id: 'api-keys', label: 'API Keys' },
];

interface SettingsShellProps {
    activeTab: string;
    workspaceName: string;
    autoAnalyze: boolean;
    userEmail: string;
    fullName: string;
    githubStatus: { connected: boolean; date?: string };
    linearStatus: { connected: boolean; date?: string };
    csvUploadCount: number;
    csvSignalCount: number;
}

function SettingsNav({ activeTab }: { activeTab: string }) {
    const router = useRouter();

    return (
        <div className="w-48 shrink-0 border-r border-[#222222] bg-[#0A0A0A] p-4 flex-col gap-1 hidden md:flex">
            <div className="px-3 py-2 text-xs font-semibold tracking-widest uppercase text-neutral-500 mt-2 mb-2">
                Settings
            </div>
            {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => router.push(`/dashboard/settings?tab=${tab.id}`)}
                        className={`text-left px-3 py-2 text-sm rounded-lg transition-colors ${isActive
                                ? 'text-white bg-white/10 font-medium'
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

export function SettingsShell({
    activeTab,
    workspaceName,
    autoAnalyze,
    userEmail,
    fullName,
    githubStatus,
    linearStatus,
    csvUploadCount,
    csvSignalCount,
}: SettingsShellProps) {
    return (
        <div className="flex h-full text-white">
            <SettingsNav activeTab={activeTab} />

            <div className="flex-1 p-8 max-w-2xl overflow-y-auto">
                {activeTab === 'workspace' && (
                    <WorkspaceTab
                        initialName={workspaceName}
                        initialAutoAnalyze={autoAnalyze}
                    />
                )}
                {activeTab === 'profile' && (
                    <ProfileTab
                        initialName={fullName}
                        email={userEmail}
                    />
                )}
                {activeTab === 'integrations' && (
                    <IntegrationsTab
                        githubStatus={githubStatus}
                        linearStatus={linearStatus}
                        csvUploadCount={csvUploadCount}
                        csvSignalCount={csvSignalCount}
                    />
                )}
                {activeTab === 'billing' && <BillingTab />}
                {activeTab === 'api-keys' && <ApiKeysTab />}
            </div>
        </div>
    );
}
