import { NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-server';

// ============================================================================
// GET /api/crm/contacts/[id]
// Fetch single contact with company and deals joins
// ============================================================================
export async function GET(request, { params }) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side (more secure than getSession)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const contactId = (await params).id;

    // Fetch contact with company join (organization_id filtering via RLS)
    // Note: Design doc mentions deals join but contacts don't directly reference deals
    // Deals reference contacts, so we'd need a reverse lookup which isn't implemented here
    const { data: contact, error } = await supabase
      .from('contacts')
      .select(`
        *,
        company:accounts(*)
      `)
      .eq('id', contactId)
      .single();

    if (error || !contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/crm/contacts/[id]
// Update contact fields
// ============================================================================
export async function PATCH(request, { params }) {
  try {
    const supabase = createApiClient(request);

    // Validate JWT token server-side (more secure than getSession)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const contactId = (await params).id;
    const body = await request.json();

    // Check if contact exists (RLS ensures organization scoping)
    const { data: existingContact, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (fetchError || !existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Sanitize body - only allow specific fields (prevent organization_id injection)
    const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'mobile', 'title', 'department'];
    const sanitizedData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedData[field] = body[field];
      }
    }

    // Basic string validation to mitigate injection-style payloads
    const stringFields = ['first_name', 'last_name', 'email', 'phone', 'mobile', 'title', 'department'];
    for (const field of stringFields) {
      if (sanitizedData[field] !== undefined) {
        if (typeof sanitizedData[field] !== 'string') {
          return NextResponse.json({ error: `Invalid type for ${field}` }, { status: 400 });
        }
        if (sanitizedData[field].length > 1024) {
          return NextResponse.json({ error: `${field} is too long` }, { status: 400 });
        }
      }
    }

    // Update contact
    const { data: updatedContact, error: updateError } = await supabase
      .from('contacts')
      .update(sanitizedData)
      .eq('id', contactId)
      .select(`
        *,
        company:accounts(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating contact:', updateError);
      return NextResponse.json(
        { error: 'Failed to update contact' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
