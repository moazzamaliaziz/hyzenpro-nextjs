import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSavedToolIds, parseToolIds } from '@/lib/saved-tool-ids';

// Check if a tool is saved
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ saved: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const toolId = searchParams.get('toolId');
        const requestedToolIds = parseToolIds(searchParams.get('toolIds'));
        const requestAll = searchParams.get('all') === 'true';

        if (!toolId && requestedToolIds.length === 0 && !requestAll) {
            return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { savedToolIds: true }
        });

        if (!user) {
            return toolId
                ? NextResponse.json({ saved: false })
                : NextResponse.json({ savedToolIds: [] });
        }

        if (requestAll) {
            return NextResponse.json({ savedToolIds: user.savedToolIds });
        }

        if (requestedToolIds.length > 0) {
            return NextResponse.json({
                savedToolIds: getSavedToolIds(user.savedToolIds, requestedToolIds),
            });
        }

        const isSaved = user.savedToolIds.includes(toolId!);
        return NextResponse.json({ saved: isSaved });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Save a tool to the Tech Stack
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { toolId } = await request.json();
        if (!toolId) {
            return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Prevent duplicates
        if (currentUser.savedToolIds.includes(toolId)) {
            return NextResponse.json({ success: true, savedToolIds: currentUser.savedToolIds });
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                savedToolIds: { push: toolId }
            }
        });

        const currentTool = await prisma.tool.findUnique({ where: { id: toolId } });
        if (currentTool && !currentTool.savedByUserIds.includes(currentUser.id)) {
            await prisma.tool.update({
                where: { id: toolId },
                data: {
                    savedByUserIds: { push: currentUser.id }
                }
            });
        }

        return NextResponse.json({ success: true, savedToolIds: updatedUser.savedToolIds });
    } catch (error) {
        console.error("Error saving tool:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Remove a tool from the Tech Stack
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const toolId = searchParams.get('toolId');

        if (!toolId) {
            return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const newSavedToolIds = currentUser.savedToolIds.filter(id => id !== toolId);

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { savedToolIds: newSavedToolIds }
        });

        const currentTool = await prisma.tool.findUnique({ where: { id: toolId } });
        if (currentTool) {
            const newSavedByUserIds = currentTool.savedByUserIds.filter(id => id !== currentUser.id);
            await prisma.tool.update({
                where: { id: toolId },
                data: { savedByUserIds: newSavedByUserIds }
            });
        }

        return NextResponse.json({ success: true, savedToolIds: updatedUser.savedToolIds });
    } catch (error) {
        console.error("Error removing tool:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
