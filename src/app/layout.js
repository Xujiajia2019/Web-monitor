"use client"
import { Inter } from 'next/font/google'
import { AppProvider, 
  Page, 
  Layout, 
  Frame, 
  Navigation, 
} from '@shopify/polaris';
import {
  OrdersMajor,
  ConversationMinor,
} from '@shopify/polaris-icons';
import '@shopify/polaris/build/esm/styles.css';
import './globals.css'


const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({ children }) {

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: 'Content Changes',
            icon: OrdersMajor,
            url: '/content'
          },
          {
            label: 'Notifications',
            icon: OrdersMajor,
            url: '/notifications'
          }
        ]}
        action={{
          icon: ConversationMinor,
          accessibilityLabel: 'Contact support'
        }}
      />
    </Navigation>
  );

  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <Page>
            <Layout>
              <Frame navigation={navigationMarkup}>
                <Page title="Dashboard">
                  <Layout>
                    <Layout.AnnotatedSection
                    >
                      {children}
                    </Layout.AnnotatedSection>
                  </Layout>
                </Page>
              </Frame>
            </Layout>
          </Page>
        </AppProvider>
      </body>
    </html>
  )
}
