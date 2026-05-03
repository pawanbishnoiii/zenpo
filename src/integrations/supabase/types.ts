export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_payment_settings: {
        Row: {
          active_mode: string
          created_at: string
          default_commission_percent: number
          id: string
          is_enabled: boolean
          is_test_mode: boolean
          live_key_id: string
          live_key_secret: string
          payout_time_window: string
          razorpay_key_id: string
          razorpay_key_secret: string
          razorpay_webhook_secret: string
          singleton: boolean
          test_key_id: string
          test_key_secret: string
          updated_at: string
        }
        Insert: {
          active_mode?: string
          created_at?: string
          default_commission_percent?: number
          id?: string
          is_enabled?: boolean
          is_test_mode?: boolean
          live_key_id?: string
          live_key_secret?: string
          payout_time_window?: string
          razorpay_key_id?: string
          razorpay_key_secret?: string
          razorpay_webhook_secret?: string
          singleton?: boolean
          test_key_id?: string
          test_key_secret?: string
          updated_at?: string
        }
        Update: {
          active_mode?: string
          created_at?: string
          default_commission_percent?: number
          id?: string
          is_enabled?: boolean
          is_test_mode?: boolean
          live_key_id?: string
          live_key_secret?: string
          payout_time_window?: string
          razorpay_key_id?: string
          razorpay_key_secret?: string
          razorpay_webhook_secret?: string
          singleton?: boolean
          test_key_id?: string
          test_key_secret?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_releases: {
        Row: {
          changelog: string
          created_at: string
          download_count: number
          file_size_bytes: number
          file_url: string
          id: string
          is_latest: boolean
          uploaded_by: string | null
          version: string
        }
        Insert: {
          changelog?: string
          created_at?: string
          download_count?: number
          file_size_bytes?: number
          file_url: string
          id?: string
          is_latest?: boolean
          uploaded_by?: string | null
          version: string
        }
        Update: {
          changelog?: string
          created_at?: string
          download_count?: number
          file_size_bytes?: number
          file_url?: string
          id?: string
          is_latest?: boolean
          uploaded_by?: string | null
          version?: string
        }
        Relationships: []
      }
      business_offers: {
        Row: {
          business_id: string
          coupon_code: string | null
          created_at: string
          description: string | null
          discount_percent: number
          ends_at: string | null
          id: string
          is_active: boolean
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          business_id: string
          coupon_code?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          coupon_code?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          business_name: string
          category: string
          commission_percent_override: number | null
          created_at: string
          default_tax_percent: number
          gst_enabled: boolean
          gst_number: string | null
          id: string
          invoice_footer: string
          invoice_prefix: string
          logo_url: string | null
          owner_id: string
          phone: string | null
          printer_type: string | null
          razorpay_link_default: boolean
          store_slug: string | null
          store_theme: string | null
          theme: string | null
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          category?: string
          commission_percent_override?: number | null
          created_at?: string
          default_tax_percent?: number
          gst_enabled?: boolean
          gst_number?: string | null
          id?: string
          invoice_footer?: string
          invoice_prefix?: string
          logo_url?: string | null
          owner_id: string
          phone?: string | null
          printer_type?: string | null
          razorpay_link_default?: boolean
          store_slug?: string | null
          store_theme?: string | null
          theme?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string
          commission_percent_override?: number | null
          created_at?: string
          default_tax_percent?: number
          gst_enabled?: boolean
          gst_number?: string | null
          id?: string
          invoice_footer?: string
          invoice_prefix?: string
          logo_url?: string | null
          owner_id?: string
          phone?: string | null
          printer_type?: string | null
          razorpay_link_default?: boolean
          store_slug?: string | null
          store_theme?: string | null
          theme?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: []
      }
      customer_credit_log: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          invoice_id: string | null
          reason: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          invoice_id?: string | null
          reason?: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          invoice_id?: string | null
          reason?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          business_id: string
          created_at: string
          credit_balance: number
          email: string | null
          full_name: string
          id: string
          last_visit_at: string | null
          notes: string | null
          phone: string | null
          total_spent: number
          updated_at: string
          vehicle_number: string | null
          vehicle_type: string | null
          visit_count: number
        }
        Insert: {
          business_id: string
          created_at?: string
          credit_balance?: number
          email?: string | null
          full_name?: string
          id?: string
          last_visit_at?: string | null
          notes?: string | null
          phone?: string | null
          total_spent?: number
          updated_at?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
          visit_count?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          credit_balance?: number
          email?: string | null
          full_name?: string
          id?: string
          last_visit_at?: string | null
          notes?: string | null
          phone?: string | null
          total_spent?: number
          updated_at?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
          visit_count?: number
        }
        Relationships: []
      }
      email_log: {
        Row: {
          business_id: string | null
          created_at: string
          error: string | null
          id: string
          invoice_id: string | null
          provider: string
          recipient: string
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          invoice_id?: string | null
          provider?: string
          recipient: string
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          invoice_id?: string | null
          provider?: string
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          invoice_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notifications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_products: {
        Row: {
          barcode_value: string | null
          brand_name: string | null
          category: string
          created_at: string
          description: string | null
          discount_price: number
          id: string
          image_url: string | null
          name: string
          price: number
          sku: string
          store_category: string
          tax_percent: number
        }
        Insert: {
          barcode_value?: string | null
          brand_name?: string | null
          category?: string
          created_at?: string
          description?: string | null
          discount_price?: number
          id?: string
          image_url?: string | null
          name: string
          price?: number
          sku: string
          store_category?: string
          tax_percent?: number
        }
        Update: {
          barcode_value?: string | null
          brand_name?: string | null
          category?: string
          created_at?: string
          description?: string | null
          discount_price?: number
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          sku?: string
          store_category?: string
          tax_percent?: number
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          total: number
        }
        Insert: {
          id?: string
          invoice_id: string
          price?: number
          product_id?: string | null
          product_name: string
          quantity?: number
          total?: number
        }
        Update: {
          id?: string
          invoice_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          business_id: string
          created_at: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_total: number
          grand_total: number
          id: string
          invoice_number: string
          payment_method: string | null
          subtotal: number
          tax_total: number
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_total?: number
          grand_total?: number
          id?: string
          invoice_number: string
          payment_method?: string | null
          subtotal?: number
          tax_total?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_total?: number
          grand_total?: number
          id?: string
          invoice_number?: string
          payment_method?: string | null
          subtotal?: number
          tax_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          business_display_name: string
          business_id: string
          created_at: string
          id: string
          is_enabled: boolean
          is_test_mode: boolean
          payment_description: string
          razorpay_key_id: string
          razorpay_key_secret: string
          updated_at: string
        }
        Insert: {
          business_display_name?: string
          business_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          is_test_mode?: boolean
          payment_description?: string
          razorpay_key_id?: string
          razorpay_key_secret?: string
          updated_at?: string
        }
        Update: {
          business_display_name?: string
          business_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          is_test_mode?: boolean
          payment_description?: string
          razorpay_key_id?: string
          razorpay_key_secret?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          business_id: string
          commission_amount: number
          commission_percent: number
          created_at: string
          currency: string
          flow: string
          id: string
          invoice_id: string | null
          is_test_mode: boolean
          method: string | null
          owner_net_amount: number
          raw_event: Json | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_payment_link_id: string | null
          settlement_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          business_id: string
          commission_amount?: number
          commission_percent?: number
          created_at?: string
          currency?: string
          flow?: string
          id?: string
          invoice_id?: string | null
          is_test_mode?: boolean
          method?: string | null
          owner_net_amount?: number
          raw_event?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_payment_link_id?: string | null
          settlement_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string
          commission_amount?: number
          commission_percent?: number
          created_at?: string
          currency?: string
          flow?: string
          id?: string
          invoice_id?: string | null
          is_test_mode?: boolean
          method?: string | null
          owner_net_amount?: number
          raw_event?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_payment_link_id?: string | null
          settlement_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      printer_settings: {
        Row: {
          business_id: string
          created_at: string
          footer_text: string | null
          header_text: string | null
          id: string
          paper_size: string | null
          show_barcode: boolean | null
          show_logo: boolean | null
        }
        Insert: {
          business_id: string
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          paper_size?: string | null
          show_barcode?: boolean | null
          show_logo?: boolean | null
        }
        Update: {
          business_id?: string
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          paper_size?: string | null
          show_barcode?: boolean | null
          show_logo?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "printer_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_approved: boolean
          product_id: string
          rating: number
          review_text: string | null
          reviewer_email: string | null
          reviewer_name: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id: string
          rating?: number
          review_text?: string | null
          reviewer_email?: string | null
          reviewer_name?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id?: string
          rating?: number
          review_text?: string | null
          reviewer_email?: string | null
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode_value: string | null
          brand_name: string | null
          business_id: string
          category: string
          created_at: string
          description: string | null
          discount_price: number
          id: string
          image_url: string | null
          name: string
          price: number
          qr_value: string | null
          sku: string
          stock: number
          tax_percent: number
          updated_at: string
        }
        Insert: {
          barcode_value?: string | null
          brand_name?: string | null
          business_id: string
          category?: string
          created_at?: string
          description?: string | null
          discount_price?: number
          id?: string
          image_url?: string | null
          name: string
          price?: number
          qr_value?: string | null
          sku: string
          stock?: number
          tax_percent?: number
          updated_at?: string
        }
        Update: {
          barcode_value?: string | null
          brand_name?: string | null
          business_id?: string
          category?: string
          created_at?: string
          description?: string | null
          discount_price?: number
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          qr_value?: string | null
          sku?: string
          stock?: number
          tax_percent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      settlements: {
        Row: {
          business_id: string
          commission_amount: number
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          notes: string | null
          payout_method: string | null
          period_end: string
          period_start: string
          processed_at: string | null
          razorpay_payout_id: string | null
          status: string
          txn_count: number
          updated_at: string
        }
        Insert: {
          business_id: string
          commission_amount?: number
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          payout_method?: string | null
          period_end: string
          period_start: string
          processed_at?: string | null
          razorpay_payout_id?: string | null
          status?: string
          txn_count?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          commission_amount?: number
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          payout_method?: string | null
          period_end?: string
          period_start?: string
          processed_at?: string | null
          razorpay_payout_id?: string | null
          status?: string
          txn_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          created_at: string
          encryption: string
          from_email: string
          from_name: string
          host: string
          id: string
          is_active: boolean
          password: string
          port: number
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          encryption?: string
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          is_active?: boolean
          password?: string
          port?: number
          updated_at?: string
          username?: string
        }
        Update: {
          created_at?: string
          encryption?: string
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          is_active?: boolean
          password?: string
          port?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          business_id: string
          created_at: string
          full_name: string
          id: string
          last_active_at: string | null
          pin: string
          role: string
        }
        Insert: {
          business_id: string
          created_at?: string
          full_name: string
          id?: string
          last_active_at?: string | null
          pin: string
          role?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          full_name?: string
          id?: string
          last_active_at?: string | null
          pin?: string
          role?: string
        }
        Relationships: []
      }
      store_content: {
        Row: {
          business_id: string
          content: string | null
          created_at: string
          id: string
          is_visible: boolean | null
          section_key: string
          title: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          content?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          section_key?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          content?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          section_key?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_media: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_active: boolean | null
          media_type: string
          sort_order: number | null
          title: string | null
          url: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          media_type?: string
          sort_order?: number | null
          title?: string | null
          url: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          media_type?: string
          sort_order?: number | null
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          badge: string | null
          created_at: string
          cta_label: string | null
          currency: string
          features: Json
          id: string
          is_active: boolean
          is_popular: boolean
          monthly_price: number
          name: string
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
          yearly_price: number
        }
        Insert: {
          badge?: string | null
          created_at?: string
          cta_label?: string | null
          currency?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          monthly_price?: number
          name: string
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
          yearly_price?: number
        }
        Update: {
          badge?: string | null
          created_at?: string
          cta_label?: string | null
          currency?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          monthly_price?: number
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
          yearly_price?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_customer_credit: {
        Args: {
          _amount: number
          _business_id: string
          _customer_id: string
          _invoice_id?: string
          _reason: string
        }
        Returns: number
      }
      aggregate_daily_settlements: {
        Args: { _period_end: string; _period_start: string }
        Returns: number
      }
      check_slug_available: { Args: { _slug: string }; Returns: boolean }
      get_store_by_slug: { Args: { _slug: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_business_owner: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
      seed_business_starter_catalog: {
        Args: { _business_id: string }
        Returns: number
      }
      set_latest_release: { Args: { _release_id: string }; Returns: undefined }
      upsert_customer_for_invoice: {
        Args: {
          _business_id: string
          _email: string
          _full_name: string
          _phone: string
          _vehicle_number?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "owner"],
    },
  },
} as const
