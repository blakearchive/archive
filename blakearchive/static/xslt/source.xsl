<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:exist="http://exist.sourceforge.net/NS/exist" xmlns:fn="http://www.w3.org/2005/02/xpath-functions" version="1.0">
    <xsl:param name="docuri"/>
    <xsl:param name="mode"/>
    <xsl:include href="includes.xsl"/>
    <xsl:template match="/">
        <div>
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="revisiondesc">
        <div>
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="userestrict">
        <p class="padding3" align="center">
            <b>Restrictions on Use</b>
        </p>
        <div align="left">
            <xsl:apply-templates mode="filedesc"/>
        </div>
    </xsl:template>
    <xsl:template match="respstmt">
        <xsl:choose>
            <xsl:when test="name(..) = 'titlestmt'">
                <div class="indent">
                    <xsl:apply-templates mode="filedesc"/>
                </div>
            </xsl:when>
            <xsl:when test="name(..) = 'changestmt'">
                <xsl:apply-templates mode="filedesc"/>
            </xsl:when>
            <xsl:otherwise>
                <div class="indent">
                    <b>Statement of Responsibility:</b>
                    <xsl:apply-templates mode="filedesc"/>
                </div>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="updatestmt">
        <p/>
        <b>Publication Announcement: </b>
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="changestmt">
        <hr/>
        <b>Task/Change: </b>
        <xsl:apply-templates mode="filedesc"/>
    </xsl:template>
    <xsl:template match="provenance">
        <p class="center">
            <b>Provenance</b>
        </p>
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="repository">
        <p class="center">
            <b>Present Location</b>
        </p>
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="institution">
        <br/>
        <xsl:apply-templates/>
        <br/>
    </xsl:template>
    <xsl:template match="addressline">
        <xsl:apply-templates/>
        <br/>
    </xsl:template>
    <xsl:template match="lb">
        <br/>
    </xsl:template>
    <xsl:template match="results">
        <div>
            <xsl:attribute name="class">
                <xsl:value-of select="@class"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="div">
        <xsl:copy-of select="."/>
    </xsl:template>
    <xsl:template match="role">
        <xsl:text> </xsl:text>
        <xsl:apply-templates/>
        <xsl:text> </xsl:text>
    </xsl:template>
    <xsl:template match="note">
        <br/>
        <b>Note</b>:
        
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="l/note">
        <p style="margin-left:5ex">
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template match="resp" mode="filedesc">
        <br/>
        <b>
            <xsl:apply-templates/>
        </b>
    </xsl:template>
    <xsl:template match="name" mode="filedesc">
        <xsl:text> </xsl:text>
        <xsl:apply-templates/>&#160;
    </xsl:template>
    <xsl:template match="date" mode="filedesc">
        <xsl:if test="name(..) != 'userestrict'">
            <br/>
            <b>Date: </b>
        </xsl:if>
        <xsl:apply-templates/>
        <xsl:text> </xsl:text>
    </xsl:template>
    <xsl:template match="lb" mode="filedesc">
        <br/>
    </xsl:template>
    <!-- inserts a colon after name in text() of origination 
        this assumes a pattern of text() followed by roles  -->
    <xsl:template match="origination">
        <br/>
        <b>Origination</b>:&#160;<xsl:value-of select="normalize-space(text())"/>:
        <xsl:for-each select="role">
            <xsl:apply-templates/>
            <!--xsl:apply-templates select="link"/-->
        </xsl:for-each>
    </xsl:template>
    <xsl:template match="principal">
        <p/>
        <div>
            <b>Statement of Responsibility:</b>
        </div>
        <div class="indentprincipal">
            <xsl:apply-templates mode="principal"/>
        </div>
    </xsl:template>
    <xsl:template match="resp" mode="principal">
        <br/>
        <b>
            <xsl:apply-templates/>
        </b>
    </xsl:template>
    <xsl:template match="name" mode="principal">
        <xsl:text> </xsl:text>
        <xsl:apply-templates/>
        <xsl:text> </xsl:text>
    </xsl:template>
    <xsl:template match="date" mode="principal">
        <xsl:text> </xsl:text>
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="lb" mode="principal">
        <br/>
    </xsl:template>
    <xsl:template match="p">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template match="funder">
        <xsl:if test=". != ''">
            <div class="indent">
                <b>Funding: </b>
                <xsl:text> </xsl:text>
                <xsl:apply-templates/>
            </div>
        </xsl:if>
    </xsl:template>
    <xsl:template match="sponsor">
        <div class="indent">
            <b>Sponsor: </b>
            <xsl:text> </xsl:text>
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="edition|extent|seriesstmt|publicationstmt">
        <xsl:param name="element">
            <xsl:value-of select="name()"/>
        </xsl:param>
        <br/>
        <xsl:call-template name="getlabel">
            <xsl:with-param name="element" select="$element"/>
        </xsl:call-template>
        <xsl:text> </xsl:text>
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="htmlincludes">
        <xsl:apply-templates select="@*|node()" mode="htmlincludes"/>
    </xsl:template>
    <xsl:template match="@*|node()" mode="htmlincludes">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()" mode="htmlincludes"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="titlestmt/title">
        <b>Title:</b>
        <xsl:text> </xsl:text>
        <xsl:value-of select="main"/>
        <xsl:if test="copy">
            <xsl:text>, </xsl:text>
            <xsl:value-of select="copy"/>
        </xsl:if>
        <xsl:if test="set">
            <xsl:text>, </xsl:text>
            <xsl:value-of select="set"/>
        </xsl:if>
        <xsl:text>: electronic edition</xsl:text>
    </xsl:template>
    <xsl:template match="*">
        <xsl:param name="element">
            <xsl:value-of select="name()"/>
        </xsl:param>
        <xsl:call-template name="getlabel">
            <xsl:with-param name="element" select="$element"/>
        </xsl:call-template>
        <xsl:text> </xsl:text>
        <xsl:apply-templates/>
    </xsl:template>
</xsl:stylesheet>