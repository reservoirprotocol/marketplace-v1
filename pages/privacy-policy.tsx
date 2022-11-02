import { ReactNode } from 'react'
import Layout from 'components/Layout'
import { NextPage } from 'next'
import Head from 'next/head'

const metadata = {
  title: (title: string) => <title>{title}</title>,
}

const H1 = ({ children }: { children: string }) => (
  <h1 className="text-2xl font-bold mb-4">{children}</h1>
);

const H2 = ({ children }: { children: string }) => (
  <h2 className="text-xl font-bold mb-2">{children}</h2>
);

const Paragraph = ({ children }: { children: ReactNode }) => (
  <p className="text-xs mb-2">{children}</p>
)

const TermsOfService: NextPage = () => {
  return (
    <Layout navbar={{}}>
      <Head>{metadata.title('Privacy Policy')}</Head>
      <div className="col-span-full">
        <div className="mt-4 mb-4 w-full px-4 md:px-16">
          <H1>PRIVACY POLICY</H1>
          <Paragraph>
            At SHOWROOM, accessible from https://showroom.art, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by SHOWROOM and how we use it.
            <br /><br />
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
          </Paragraph>
          <H2>Log Files</H2>
          <Paragraph>
            SHOWROOM follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services&apos; analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information.
          </Paragraph>
          <H2>Cookies and Web Beacons</H2>
          <Paragraph>
            Like any other website, SHOWROOM uses &apos;cookies&apos;. These cookies are used to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
          </Paragraph>
          <H2>Google DoubleClick DART Cookie</H2>
          <Paragraph>
            Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to showroom.art and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – https://policies.google.com/technologies/ads
          </Paragraph>
          <H2>Our Advertising Partners</H2>
          <Paragraph>
            Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has their own Privacy Policy for their policies on user data. For easier access, we hyperlinked to their Privacy Policies below.
            <br /><br />
            Google: https://policies.google.com/technologies/ads
          </Paragraph>
          <H2>Privacy Policies</H2>
          <Paragraph>
            You may consult this list to find the Privacy Policy for each of the advertising partners of SHOWROOM.
            <br /><br />
            Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on SHOWROOM, which are sent directly to users&apos; browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
            <br /><br />
            Note that SHOWROOM has no access to or control over these cookies that are used by third-party advertisers.
          </Paragraph>
          <H2>Third Party Privacy Policies</H2>
          <Paragraph>
            SHOWROOM&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
            <br /><br />
            You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers&apos; respective websites. What Are Cookies?
          </Paragraph>
          <H2>Children&apos;s Information</H2>
          <Paragraph>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
            <br /><br />
            SHOWROOM does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </Paragraph>
          <H2>Online Privacy Policy Only</H2>
          <Paragraph>
            This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in SHOWROOM. This policy is not applicable to any information collected offline or via channels other than this website.
          </Paragraph>
          <H2>Consent</H2>
          <Paragraph>
            By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
          </Paragraph>
        </div>
      </div>
    </Layout>
  );
}

export default TermsOfService;
